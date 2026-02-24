import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  fetchApisForService,
  getAppConfig,
  getServiceInfo,
} from '../client.js';

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

interface ServiceWithApis {
  id: string;
  name: string;
  apis: { name: string; endpoint: string; type: string }[];
}

interface ServicesResponse {
  mode: 'single' | 'multi';
  description: string;
  services: ServiceWithApis[];
}

export async function handleGetServices(): Promise<ServicesResponse> {
  const config = getAppConfig();

  if (config.mode === 'single') {
    const [apis, serviceInfo] = await Promise.all([
      fetchApisForService(config.serviceDomain),
      getServiceInfo(config.serviceDomain),
    ]);
    return {
      mode: 'single',
      description: 'Single service mode - serviceId parameter is optional',
      services: [
        {
          id: config.serviceDomain,
          name: serviceInfo.name,
          apis,
        },
      ],
    };
  }

  // Multi service mode - fetch APIs and service info for all services in parallel
  const servicesWithApis = await Promise.all(
    config.services.map(async (s) => {
      const [apis, serviceInfo] = await Promise.all([
        fetchApisForService(s.id),
        getServiceInfo(s.id),
      ]);
      return {
        id: s.id,
        name: serviceInfo.name,
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
