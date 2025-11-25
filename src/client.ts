import { createClient, createManagementClient, MicroCMSQueries } from 'microcms-js-sdk';
import type { MicroCMSContent, MicroCMSListResponse } from './types.js';
import { parseConfig } from './config.js';

const config = parseConfig();

export const microCMSClient = createClient({
  serviceDomain: config.serviceDomain,
  apiKey: config.apiKey,
});

export const microCMSManagementClient = createManagementClient({
  serviceDomain: config.serviceDomain,
  apiKey: config.apiKey,
});

export const microCMSConfig = {
  serviceDomain: config.serviceDomain,
  apiKey: config.apiKey,
};

export async function getList<T = MicroCMSContent>(
  endpoint: string,
  queries?: MicroCMSQueries
): Promise<MicroCMSListResponse<T>> {
  return await microCMSClient.getList<T>({
    endpoint,
    queries,
  });
}

export async function getListDetail<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  queries?: MicroCMSQueries
): Promise<T> {
  return await microCMSClient.getListDetail<T>({
    endpoint,
    contentId,
    queries,
  });
}

export async function create<T = MicroCMSContent>(
  endpoint: string,
  content: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>,
  options?: { isDraft?: boolean; contentId?: string }
): Promise<{ id: string }> {
  return await microCMSClient.create({
    endpoint,
    content,
    ...options,
  });
}

export async function update<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  content: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>,
  options?: { isDraft?: boolean }
): Promise<{ id: string }> {
  return await microCMSClient.update({
    endpoint,
    contentId,
    content,
    ...options,
  });
}

export async function patch<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  content: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>>,
  options?: { isDraft?: boolean }
): Promise<{ id: string }> {
  return await microCMSClient.update({
    endpoint,
    contentId,
    content,
    ...options,
  });
}

export async function deleteContent(
  endpoint: string,
  contentId: string
): Promise<void> {
  return await microCMSClient.delete({
    endpoint,
    contentId,
  });
}

export async function getApiInfo(endpoint: string): Promise<any> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/apis/${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get API info: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function getApiList(): Promise<any> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/apis`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get API list: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function getMember(memberId: string): Promise<any> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/members/${memberId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get member: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function deleteMedia(mediaUrl: string): Promise<{ id: string }> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v2/media?url=${encodeURIComponent(mediaUrl)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete media: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function patchContentStatus(
  endpoint: string,
  contentId: string,
  status: 'PUBLISH' | 'DRAFT'
): Promise<void> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}/${contentId}/status`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: [status] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to patch content status: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

export async function patchContentCreatedBy(
  endpoint: string,
  contentId: string,
  memberId: string
): Promise<{ id: string }> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}/${contentId}/createdBy`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ createdBy: memberId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to patch content createdBy: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function getListMeta(
  endpoint: string,
  options?: { limit?: number; offset?: number }
): Promise<any> {
  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.offset) queryParams.append('offset', options.offset.toString());

  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get contents list: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function getContentManagement(
  endpoint: string,
  contentId: string
): Promise<any> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/contents/${endpoint}/${contentId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get content: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}