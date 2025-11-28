import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { update } from '../client.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';
import type { MicroCMSUpdateOptions, ToolParameters } from '../types.js';

export const updateContentPublishedTool: Tool = {
  name: 'microcms_update_content_published',
  description: FIELD_FORMATS_DESCRIPTION,
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
        description: 'Content ID to update',
      },
      content: {
        type: 'object',
        description:
          `Content data to update (JSON object). ` + FIELD_FORMATS_DESCRIPTION,
      },
    },
    required: ['endpoint', 'contentId', 'content'],
  },
};

export async function handleUpdateContentPublished(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, contentId, content } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (!content) {
    throw new Error('content is required');
  }

  const updateOptions: MicroCMSUpdateOptions = {
    isDraft: false, // Always publish
  };

  return await update(endpoint, contentId, content, updateOptions, serviceId);
}
