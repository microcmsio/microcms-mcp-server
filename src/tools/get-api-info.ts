import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getApiInfo } from '../client.js';
import type { ToolParameters } from '../types.js';

export const getApiInfoTool: Tool = {
  name: 'microcms_get_api_info',
  description:
    'Get API schema information from microCMS Management API. In relation and relationList field, you can get its schema using referencedApiEndpoint and microcms_get_api_info tool.',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description:
          'Service ID (required in multi-service mode, optional in single-service mode)',
      },
      endpoint: {
        type: 'string',
        description:
          'Content type name to get schema info (e.g., "blogs", "news")',
      },
    },
    required: ['endpoint'],
  },
};

export async function handleGetApiInfo(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint } = params;

  return await getApiInfo(endpoint, serviceId);
}
