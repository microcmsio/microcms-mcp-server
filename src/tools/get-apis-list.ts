import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getApiList } from '../client.js';
import type { ToolParameters } from '../types.js';

export const getApiListTool: Tool = {
  name: 'microcms_get_api_list',
  description:
    'Get list of all available APIs (endpoints) from microCMS Management API. Returns API name, endpoint, and type (list/object) for each API.',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description:
          'Service ID (required in multi-service mode, optional in single-service mode)',
      },
    },
    required: [],
  },
};

export async function handleGetApiList(
  _params: ToolParameters,
  serviceId?: string
) {
  return await getApiList(serviceId);
}
