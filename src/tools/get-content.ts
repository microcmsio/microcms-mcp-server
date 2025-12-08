import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getListDetail } from '../client.js';
import type { MicroCMSGetOptions, ToolParameters } from '../types.js';

export const getContentTool: Tool = {
  name: 'microcms_get_content',
  description: 'Get a specific content from microCMS',
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
      contentId: {
        type: 'string',
        description: 'Content ID to retrieve',
      },
      draftKey: {
        type: 'string',
        description: 'Draft key for preview',
      },
      fields: {
        type: 'string',
        description: 'Comma-separated list of fields to retrieve',
      },
      depth: {
        type: 'number',
        description: 'Depth of reference expansion (1-3)',
        minimum: 1,
        maximum: 3,
      },
    },
    required: ['endpoint', 'contentId'],
  },
};

export async function handleGetContent(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, contentId, ...options } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  const queries: MicroCMSGetOptions = {};

  if (options.draftKey) queries.draftKey = options.draftKey;
  if (options.fields) queries.fields = options.fields;
  if (options.depth) queries.depth = options.depth;

  return await getListDetail(endpoint, contentId, queries, serviceId);
}
