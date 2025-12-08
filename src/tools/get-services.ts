import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getApiList, getAppConfig } from '../client.js';

export const getServicesTool: Tool = {
  name: 'microcms_get_services',
  description:
    'Get list of configured microCMS services and their available APIs (endpoints). Use this tool first to discover which services are available and find the correct serviceId for other tools. In multi-service mode, serviceId is required for all other tools.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

interface ServiceInfo {
  id: string;
  apis: { name: string; endpoint: string; type: string }[];
}

interface ServicesResponse {
  mode: 'single' | 'multi';
  description: string;
  services: ServiceInfo[];
}

/**
 * Fetch API list for a service
 */
async function fetchApisForService(
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

export async function handleGetServices(): Promise<ServicesResponse> {
  const config = getAppConfig();

  if (config.mode === 'single') {
    const apis = await fetchApisForService(config.serviceDomain);
    return {
      mode: 'single',
      description: 'Single service mode - serviceId parameter is optional',
      services: [
        {
          id: config.serviceDomain,
          apis,
        },
      ],
    };
  }

  // Multi service mode - fetch APIs for all services in parallel
  const servicesWithApis = await Promise.all(
    config.services.map(async (s) => {
      const apis = await fetchApisForService(s.id);
      return {
        id: s.id,
        apis,
      };
    })
  );

  return {
    mode: 'multi',
    description:
      'Multi service mode - serviceId parameter is required for all tools. Use the serviceId that contains the endpoint you need.',
    services: servicesWithApis,
  };
}
