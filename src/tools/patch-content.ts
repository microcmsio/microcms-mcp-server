import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { patch } from '../client.js';
import type { ToolParameters, MicroCMSUpdateOptions } from '../types.js';

export const patchContentTool: Tool = {
  name: 'microcms_patch_content',
  description: 'Partially update content in microCMS (PATCH). Field type specifications: Image fields require URLs from the same microCMS service (e.g., "https://images.microcms-assets.io/assets/xxx/yyy/sample.png"). Multiple image fields use array format. Rich editor fields expect HTML strings. Date fields use ISO 8601 format. Select fields use arrays. Content reference fields use contentId strings or arrays for multiple references.',
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
        description: 'Partial content data to update (JSON object). Field formats: text="string", richEditor="<h1>HTML</h1>", image="https://images.microcms-assets.io/...", multipleImages=["url1","url2"], date="2020-04-23T14:32:38.163Z", select=["option1","option2"], contentReference="contentId" or ["id1","id2"].',
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