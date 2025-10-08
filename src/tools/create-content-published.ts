import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { create } from '../client.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';
import type { ToolParameters, MicroCMSCreateOptions } from '../types.js';

export const createContentPublishedTool: Tool = {
  name: 'microcms_create_content_published',
  description: 'Create new content in microCMS and publish it immediately. Field type specifications: Image fields require URLs from the same microCMS service (e.g., "https://images.microcms-assets.io/assets/xxx/yyy/sample.png"), only the URL string is required. Multiple image fields use array format. Rich editor fields expect HTML strings. Date fields use ISO 8601 format. Select fields use arrays. Content reference fields use contentId strings or arrays for multiple references, and you can get contentIds from microcms_get_list tool.',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'Content type name (e.g., "blogs", "news")',
      },
      content: {
        type: 'object',
        description:
          'Content data to create (JSON object). ' + FIELD_FORMATS_DESCRIPTION,
      },
      contentId: {
        type: 'string',
        description: 'Specific content ID to assign',
      },
    },
    required: ['endpoint', 'content'],
  },
};

export async function handleCreateContentPublished(params: ToolParameters) {
  const { endpoint, content, ...options } = params;

  if (!content) {
    throw new Error('content is required');
  }

  const createOptions: MicroCMSCreateOptions = {
    isDraft: false, // Always publish
  };

  if (options.contentId) createOptions.contentId = options.contentId;

  return await create(endpoint, content, createOptions);
}
