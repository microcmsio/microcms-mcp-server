import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getApiList as getApiList } from '../client.js';
import type { ToolParameters } from '../types.js';

export const getApiListTool: Tool = {
  name: 'microcms_get_api_list',
  description: 'Get list of all available APIs (endpoints) from microCMS Management API. Returns API name, endpoint, and type (list/object) for each API.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function handleGetApiList(params: ToolParameters) {
  return await getApiList();
}
