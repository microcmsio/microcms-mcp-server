import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getListMeta } from '../client.js';
import type { ToolParameters } from '../types.js';

export const getListMetaTool: Tool = {
  name: 'microcms_get_list_meta',
  description:
    'Get a list of contents with metadata from microCMS Management API. IMPORTANT: Use this tool ONLY when the user message contains "メタ" (meta) or "メタ情報" (metadata). This API returns metadata information such as status, createdBy, updatedBy, reservationTime, closedAt, and customStatus that are not available in the regular content API. For regular content retrieval, use microcms_get_list instead.',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'Content type name (e.g., "blogs", "news")',
      },
      limit: {
        type: 'number',
        description: 'Number of contents to retrieve (default: 10, max: 100)',
        minimum: 1,
        maximum: 100,
      },
      offset: {
        type: 'number',
        description: 'Offset for pagination (default: 0)',
        minimum: 0,
      },
    },
    required: ['endpoint'],
  },
};

export async function handleGetListMeta(params: ToolParameters) {
  const { endpoint, limit, offset } = params;

  if (!endpoint) {
    throw new Error('endpoint is required');
  }

  const options: { limit?: number; offset?: number } = {};
  if (limit !== undefined) options.limit = limit;
  if (offset !== undefined) options.offset = offset;

  return await getListMeta(endpoint, options);
}
