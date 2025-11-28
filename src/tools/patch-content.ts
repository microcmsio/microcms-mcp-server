import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { patch } from '../client.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';
import type { MicroCMSUpdateOptions, ToolParameters } from '../types.js';

export const patchContentTool: Tool = {
  name: 'microcms_patch_content',
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
          `Partial content data to update (JSON object). ` +
          FIELD_FORMATS_DESCRIPTION,
      },
      isDraft: {
        type: 'boolean',
        description: 'Save as draft',
      },
    },
    required: ['endpoint', 'contentId', 'content'],
  },
};

export async function handlePatchContent(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, contentId, content, ...options } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (!content) {
    throw new Error('content is required');
  }

  const updateOptions: MicroCMSUpdateOptions = {};

  if (options.isDraft !== undefined) updateOptions.isDraft = options.isDraft;

  return await patch(endpoint, contentId, content, updateOptions, serviceId);
}
