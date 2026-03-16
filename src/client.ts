import {
  createClient,
  createManagementClient,
  type MicroCMSQueries,
} from 'microcms-js-sdk';
import { parseConfig } from './config.js';
import type {
  ApiInfo,
  ApiListResponse,
  AppConfig,
  ContentMeta,
  ContentMetaListResponse,
  MediaListResponse,
  MediaUploadResponse,
  MemberInfo,
  MicroCMSContent,
  MicroCMSListResponse,
  ServiceConfig,
  ServiceInfo,
} from './types.js';

// Use ReturnType to get actual client types from factory functions
type ContentClient = ReturnType<typeof createClient>;
type ManagementClient = ReturnType<typeof createManagementClient>;

// Client storage for multi-service mode
interface ServiceClients {
  client: ContentClient;
  managementClient: ManagementClient;
  serviceDomain: string;
  apiKey: string;
}

const clientMap = new Map<string, ServiceClients>();
let appConfig: AppConfig | null = null;
let defaultServiceId: string | null = null;

/**
 * Initialize clients based on configuration.
 * Call this once at server startup.
 */
export function initializeClients(): AppConfig {
  appConfig = parseConfig();

  if (appConfig.mode === 'single') {
    // Single service mode (legacy)
    const clients = createClientsForService({
      id: appConfig.serviceDomain,
      apiKey: appConfig.apiKey,
    });
    clientMap.set(appConfig.serviceDomain, clients);
    defaultServiceId = appConfig.serviceDomain;
  } else {
    // Multi service mode
    for (const service of appConfig.services) {
      const clients = createClientsForService(service);
      clientMap.set(service.id, clients);
    }
    defaultServiceId = appConfig.services[0].id;
  }

  return appConfig;
}

/**
 * Create microCMS clients for a service
 */
function createClientsForService(service: ServiceConfig): ServiceClients {
  return {
    client: createClient({
      serviceDomain: service.id,
      apiKey: service.apiKey,
    }),
    managementClient: createManagementClient({
      serviceDomain: service.id,
      apiKey: service.apiKey,
    }),
    serviceDomain: service.id,
    apiKey: service.apiKey,
  };
}

/**
 * Get current app configuration
 */
export function getAppConfig(): AppConfig {
  if (!appConfig) {
    throw new Error('Clients not initialized. Call initializeClients() first.');
  }
  return appConfig;
}

/**
 * Get all registered service IDs
 */
export function getServiceIds(): string[] {
  return Array.from(clientMap.keys());
}

/**
 * Check if a service is registered
 */
export function hasService(serviceId: string): boolean {
  return clientMap.has(serviceId);
}

/**
 * Get clients for a specific service.
 * In single-service mode, serviceId is optional and defaults to the configured service.
 * In multi-service mode, serviceId is required.
 * Automatically initializes clients if not already done (lazy initialization).
 */
export function getClientsForService(serviceId?: string): ServiceClients {
  ensureInitialized();

  // Validate serviceId requirement based on mode
  if (!serviceId) {
    if (appConfig?.mode === 'multi') {
      const available = getServiceIds().join(', ');
      throw new Error(
        `serviceId is required in multi-service mode. Available services: ${available}`
      );
    }
    return getDefaultClients();
  }

  const clients = clientMap.get(serviceId);
  if (!clients) {
    const available = getServiceIds().join(', ');
    throw new Error(
      `Service "${serviceId}" not found. Available services: ${available || 'none'}`
    );
  }
  return clients;
}

/**
 * Ensure clients are initialized.
 * This provides lazy initialization for backward compatibility with legacy exports.
 */
function ensureInitialized(): void {
  if (!appConfig) {
    initializeClients();
  }
}

/**
 * Get the default service clients (for backward compatibility)
 * Automatically initializes clients if not already done (lazy initialization).
 */
function getDefaultClients(): ServiceClients {
  ensureInitialized();
  if (!defaultServiceId) {
    throw new Error('Clients not initialized. This should not happen.');
  }
  return getClientsForService(defaultServiceId);
}

// Legacy exports for backward compatibility
export const microCMSClient = {
  getList: <T = MicroCMSContent>(params: {
    endpoint: string;
    queries?: MicroCMSQueries;
  }) => {
    return getDefaultClients().client.getList<T>(params);
  },
  getListDetail: <T = MicroCMSContent>(params: {
    endpoint: string;
    contentId: string;
    queries?: MicroCMSQueries;
  }) => {
    return getDefaultClients().client.getListDetail<T>(params);
  },
  create: (params: {
    endpoint: string;
    content: Record<string, unknown>;
    contentId?: string;
    isDraft?: boolean;
  }) => {
    return getDefaultClients().client.create(params);
  },
  update: (params: {
    endpoint: string;
    contentId: string;
    content: Record<string, unknown>;
    isDraft?: boolean;
  }) => {
    return getDefaultClients().client.update(params);
  },
  delete: (params: { endpoint: string; contentId: string }) => {
    return getDefaultClients().client.delete(params);
  },
};

export const microCMSManagementClient = {
  uploadMedia: (
    params:
      | { data: File | Blob }
      | {
          url: string;
          fileName?: string;
          customRequestHeaders?: Record<string, string>;
        }
  ) => {
    // SDK types don't fully match API capabilities, type assertion required
    // biome-ignore lint/suspicious/noExplicitAny: SDK type limitation
    return getDefaultClients().managementClient.uploadMedia(params as any);
  },
};

export const microCMSConfig = {
  get serviceDomain() {
    return getDefaultClients().serviceDomain;
  },
  get apiKey() {
    return getDefaultClients().apiKey;
  },
};

/**
 * Get service information (name, id) from the microCMS Management API.
 * Requires the GET /api/v1/service endpoint (PR #21694).
 * Falls back gracefully if the endpoint is not available.
 */
export async function getServiceInfo(serviceId?: string): Promise<ServiceInfo> {
  const clients = getClientsForService(serviceId);

  try {
    const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/service`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MICROCMS-API-KEY': clients.apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id: clients.serviceDomain,
        name: data.name || clients.serviceDomain,
      };
    }

    // 404 (endpoint not implemented) or 403 (no permission) - fall back
    return { id: clients.serviceDomain, name: clients.serviceDomain };
  } catch {
    // Network error - fall back
    return { id: clients.serviceDomain, name: clients.serviceDomain };
  }
}

/**
 * Attempt to fetch service info for all configured services.
 * Failures do not block server startup.
 */
export async function fetchAllServiceInfo(): Promise<Map<string, ServiceInfo>> {
  const serviceIds = getServiceIds();
  const infoMap = new Map<string, ServiceInfo>();

  const results = await Promise.allSettled(
    serviceIds.map((id) => getServiceInfo(id))
  );

  for (let i = 0; i < serviceIds.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      infoMap.set(serviceIds[i], result.value);
    } else {
      infoMap.set(serviceIds[i], { id: serviceIds[i], name: serviceIds[i] });
    }
  }

  return infoMap;
}

// Service-specific API functions
export async function getList<T = MicroCMSContent>(
  endpoint: string,
  queries?: MicroCMSQueries,
  serviceId?: string
): Promise<MicroCMSListResponse<T>> {
  const clients = getClientsForService(serviceId);
  return await clients.client.getList<T>({
    endpoint,
    queries,
  });
}

export async function getListDetail<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  queries?: MicroCMSQueries,
  serviceId?: string
): Promise<T> {
  const clients = getClientsForService(serviceId);
  return await clients.client.getListDetail<T>({
    endpoint,
    contentId,
    queries,
  });
}

export async function create<T = MicroCMSContent>(
  endpoint: string,
  content: Omit<
    T,
    'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'
  >,
  options?: { isDraft?: boolean; contentId?: string },
  serviceId?: string
): Promise<{ id: string }> {
  const clients = getClientsForService(serviceId);
  return await clients.client.create({
    endpoint,
    content,
    ...options,
  });
}

export async function update<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  content: Omit<
    T,
    'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'
  >,
  options?: { isDraft?: boolean },
  serviceId?: string
): Promise<{ id: string }> {
  const clients = getClientsForService(serviceId);
  return await clients.client.update({
    endpoint,
    contentId,
    content,
    ...options,
  });
}

export async function patch<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  content: Partial<
    Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>
  >,
  options?: { isDraft?: boolean },
  serviceId?: string
): Promise<{ id: string }> {
  const clients = getClientsForService(serviceId);
  return await clients.client.update({
    endpoint,
    contentId,
    content,
    ...options,
  });
}

export async function deleteContent(
  endpoint: string,
  contentId: string,
  serviceId?: string
): Promise<void> {
  const clients = getClientsForService(serviceId);
  return await clients.client.delete({
    endpoint,
    contentId,
  });
}

export async function getApiInfo(
  endpoint: string,
  serviceId?: string
): Promise<ApiInfo> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/apis/${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get API info: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Fetch formatted API list for a service (name, endpoint, type).
 * Returns empty array on failure.
 */
export async function fetchApisForService(
  serviceId: string
): Promise<{ name: string; endpoint: string; type: string }[]> {
  try {
    const result = await getApiList(serviceId);
    if (result && Array.isArray(result.apis)) {
      return result.apis.map(
        (api: {
          apiName?: string;
          name?: string;
          apiEndpoint?: string;
          endpoint?: string;
          apiType?: string[];
          type?: string;
        }) => ({
          name: api.apiName || api.name || '',
          endpoint: api.apiEndpoint || api.endpoint || '',
          type:
            api.type === 'list' ||
            (Array.isArray(api.apiType) && api.apiType.includes('LIST'))
              ? 'list'
              : 'object',
        })
      );
    }
    return [];
  } catch {
    return [];
  }
}

export async function getApiList(serviceId?: string): Promise<ApiListResponse> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/apis`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get API list: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

export async function getMember(
  memberId: string,
  serviceId?: string
): Promise<MemberInfo> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/members/${memberId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get member: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

export async function deleteMedia(
  mediaUrl: string,
  serviceId?: string
): Promise<{ id: string }> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v2/media?url=${encodeURIComponent(mediaUrl)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete media: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

export async function patchContentStatus(
  endpoint: string,
  contentId: string,
  status: 'PUBLISH' | 'DRAFT',
  serviceId?: string
): Promise<void> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}/${contentId}/status`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: [status] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to patch content status: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
}

export async function patchContentCreatedBy(
  endpoint: string,
  contentId: string,
  memberId: string,
  serviceId?: string
): Promise<{ id: string }> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}/${contentId}/createdBy`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ createdBy: memberId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to patch content createdBy: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

export async function getListMeta(
  endpoint: string,
  options?: { limit?: number; offset?: number },
  serviceId?: string
): Promise<ContentMetaListResponse> {
  const clients = getClientsForService(serviceId);
  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.offset) queryParams.append('offset', options.offset.toString());

  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get contents list: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

export async function getContentManagement(
  endpoint: string,
  contentId: string,
  serviceId?: string
): Promise<ContentMeta> {
  const clients = getClientsForService(serviceId);
  const url = `https://${clients.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}/${contentId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': clients.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get content: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

// Media functions with service support
export async function getMedia(
  params?: {
    limit?: number;
    imageOnly?: boolean;
    fileName?: string;
    token?: string;
  },
  serviceId?: string
): Promise<MediaListResponse> {
  const clients = getClientsForService(serviceId);
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.imageOnly) queryParams.append('imageOnly', 'true');
  if (params?.fileName) queryParams.append('fileName', params.fileName);
  if (params?.token) queryParams.append('token', params.token);

  const response = await fetch(
    `https://${clients.serviceDomain}.microcms-management.io/api/v2/media?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'X-MICROCMS-API-KEY': clients.apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Media retrieval failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function uploadMedia(
  params:
    | { data: File | Blob; name?: string }
    | {
        url: string;
        fileName?: string;
        customRequestHeaders?: Record<string, string>;
      },
  serviceId?: string
): Promise<MediaUploadResponse> {
  const clients = getClientsForService(serviceId);
  // SDK types don't fully match API capabilities, type assertion required
  // biome-ignore lint/suspicious/noExplicitAny: SDK type limitation
  return await clients.managementClient.uploadMedia(params as any);
}
