import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { update } from '../client.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';
import type { ToolParameters, MicroCMSUpdateOptions } from '../types.js';

export const updateContentPublishedTool: Tool = {
  name: 'microcms_update_content_published',
  description: 'Update content in microCMS (PUT - full update) and publish it immediately. Field type specifications: Image fields require URLs from the same microCMS service (e.g., "https://images.microcms-assets.io/assets/xxx/yyy/sample.png"). Multiple image fields use array format. Rich editor fields expect HTML strings. Date fields use ISO 8601 format. Select fields use arrays. Content reference fields use contentId strings or arrays for multiple references.',
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
        description:
          'Content data to update (JSON object). ' + FIELD_FORMATS_DESCRIPTION,
      },
    },
    required: ['endpoint', 'contentId', 'content'],
  },
};

export async function handleUpdateContentPublished(params: ToolParameters) {
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

  return await update(endpoint, contentId, content, updateOptions);
}
