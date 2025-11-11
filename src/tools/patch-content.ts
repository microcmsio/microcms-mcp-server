import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { patch } from '../client.js';
import type { ToolParameters, MicroCMSUpdateOptions } from '../types.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';

export const patchContentTool: Tool = {
  name: 'microcms_patch_content',
  description: FIELD_FORMATS_DESCRIPTION,
  inputSchema: {
    type: 'object',
    properties: {
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
        description: `Partial content data to update (JSON object). ` + FIELD_FORMATS_DESCRIPTION,
      },
      isDraft: {
        type: 'boolean',
        description: 'Save as draft',
      },
    },
    required: ['endpoint', 'contentId', 'content'],
  },
};

export async function handlePatchContent(params: ToolParameters) {
  const { endpoint, contentId, content, ...options } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (!content) {
    throw new Error('content is required');
  }

  const updateOptions: MicroCMSUpdateOptions = {};

  if (options.isDraft !== undefined) updateOptions.isDraft = options.isDraft;

  return await patch(endpoint, contentId, content, updateOptions);
}