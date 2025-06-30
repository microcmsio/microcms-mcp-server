import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { create } from '../client.js';
import type { ToolParameters, MicroCMSCreateOptions } from '../types.js';

export const createContentDraftTool: Tool = {
  name: 'microcms_create_content_draft',
  description: 'Create new content in microCMS as draft. Field type specifications: Image fields require URLs from the same microCMS service (e.g., "https://images.microcms-assets.io/assets/xxx/yyy/sample.png"), only the URL string is required. Multiple image fields use array format. Rich editor fields expect HTML strings. Date fields use ISO 8601 format. Select fields use arrays. Content reference fields use contentId strings or arrays for multiple references.',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'Content type name (e.g., "blogs", "news")',
      },
      content: {
        type: 'object',
        description: 'Content data to create (JSON object). Field formats: text="string", richEditor="<h1>HTML</h1>", image="https://images.microcms-assets.io/...", multipleImages=["url1","url2"], date="2020-04-23T14:32:38.163Z", select=["option1","option2"], contentReference="contentId" or ["id1","id2"].',
      },
      contentId: {
        type: 'string',
        description: 'Specific content ID to assign',
      },
    },
    required: ['endpoint', 'content'],
  },
};

export async function handleCreateContentDraft(params: ToolParameters) {
  const { endpoint, content, ...options } = params;

  if (!content) {
    throw new Error('content is required');
  }

  const createOptions: MicroCMSCreateOptions = {
    isDraft: true, // Always save as draft
  };

  if (options.contentId) createOptions.contentId = options.contentId;

  return await create(endpoint, content, createOptions);
}