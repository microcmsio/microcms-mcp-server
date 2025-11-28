import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { deleteContent } from '../client.js';
import type { ToolParameters } from '../types.js';

export const deleteContentTool: Tool = {
  name: 'microcms_delete_content',
  description: 'Delete content from microCMS',
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
        description: 'Content ID to delete',
      },
    },
    required: ['endpoint', 'contentId'],
  },
};

export async function handleDeleteContent(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, contentId } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  await deleteContent(endpoint, contentId, serviceId);
  return { message: `Content ${contentId} deleted successfully` };
}
