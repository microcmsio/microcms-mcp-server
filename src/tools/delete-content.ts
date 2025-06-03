import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { deleteContent } from '../client.js';
import type { ToolParameters } from '../types.js';

export const deleteContentTool: Tool = {
  name: 'microcms_delete_content',
  description: 'Delete content from microCMS',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'Content type name (e.g., "blogs", "news")',
      },
      contentId: {
        type: 'string',
        description: 'Content ID to delete',
      },
    },
    required: ['endpoint', 'contentId'],
  },
};

export async function handleDeleteContent(params: ToolParameters) {
  const { endpoint, contentId } = params;
  
  if (!contentId) {
    throw new Error('contentId is required');
  }

  await deleteContent(endpoint, contentId);
  return { message: `Content ${contentId} deleted successfully` };
}