import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { update } from '../client.js';
import type { ToolParameters, MicroCMSUpdateOptions } from '../types.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';

export const updateContentDraftTool: Tool = {
  name: 'microcms_update_content_draft',
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
        description: `Content data to update (JSON object). ` + FIELD_FORMATS_DESCRIPTION,
      },
    },
    required: ['endpoint', 'contentId', 'content'],
  },
};

export async function handleUpdateContentDraft(params: ToolParameters) {
  const { endpoint, contentId, content } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (!content) {
    throw new Error('content is required');
  }

  const updateOptions: MicroCMSUpdateOptions = {
    isDraft: true, // Always save as draft
  };

  return await update(endpoint, contentId, content, updateOptions);
}