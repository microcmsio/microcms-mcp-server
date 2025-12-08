import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { create } from '../client.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';
import type { MicroCMSCreateOptions, ToolParameters } from '../types.js';

export const createContentPublishedTool: Tool = {
  name: 'microcms_create_content_published',
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
      content: {
        type: 'object',
        description: `Content data to create (JSON object). ${FIELD_FORMATS_DESCRIPTION}`,
      },
      contentId: {
        type: 'string',
        description: 'Specific content ID to assign',
      },
    },
    required: ['endpoint', 'content'],
  },
};

export async function handleCreateContentPublished(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, content, ...options } = params;

  if (!content) {
    throw new Error('content is required');
  }

  const createOptions: MicroCMSCreateOptions = {
    isDraft: false, // Always publish
  };

  if (options.contentId) createOptions.contentId = options.contentId;

  return await create(endpoint, content, createOptions, serviceId);
}
