import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getList } from '../client.js';
import type { ToolParameters, MicroCMSListOptions } from '../types.js';

export const getListTool: Tool = {
  name: 'microcms_get_list',
  description: 'Get a list of contents from microCMS',
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
        description: 'Content type name (e.g., "blogs", "news")',
      },
      draftKey: {
        type: 'string',
        description: 'Draft key for preview',
      },
      limit: {
        type: 'number',
        description: 'Number of contents to retrieve (1-100)',
        minimum: 1,
        maximum: 100,
      },
      offset: {
        type: 'number',
        description: 'Offset for pagination',
        minimum: 0,
      },
      orders: {
        type: 'string',
        description: 'Sort order (e.g., "-publishedAt" for descending)',
      },
      q: {
        type: 'string',
        description: 'Full-text search query',
      },
      fields: {
        type: 'string',
        description: 'Comma-separated list of fields to retrieve',
      },
      ids: {
        type: 'string',
        description: 'Comma-separated list of content IDs',
      },
      filters: {
        type: 'string',
        description: 'Filter conditions',
      },
      depth: {
        type: 'number',
        description: 'Depth of reference expansion (1-3)',
        minimum: 1,
        maximum: 3,
      },
    },
    required: ['endpoint'],
  },
};

export async function handleGetList(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, ...options } = params;

  const queries: MicroCMSListOptions = {};

  if (options.draftKey) queries.draftKey = options.draftKey;
  if (options.limit) queries.limit = options.limit;
  if (options.offset) queries.offset = options.offset;
  if (options.orders) queries.orders = options.orders;
  if (options.q) queries.q = options.q;
  if (options.fields) queries.fields = options.fields;
  if (options.ids) queries.ids = options.ids;
  if (options.filters) queries.filters = options.filters;
  if (options.depth) queries.depth = options.depth;

  return await getList(endpoint, queries, serviceId);
}
