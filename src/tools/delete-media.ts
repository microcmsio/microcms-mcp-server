import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { deleteMedia } from '../client.js';
import type { MediaToolParameters } from '../types.js';

export const deleteMediaTool: Tool = {
  name: 'microcms_delete_media',
  description:
    'Delete media files from microCMS (Management API). Supports deletion of both images and files. Requires media deletion permissions. Note: Media referenced by content cannot be deleted.',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description:
          'Service ID (required in multi-service mode, optional in single-service mode)',
      },
      url: {
        type: 'string',
        description:
          'URL of the media to delete (e.g., "https://images.microcms-assets.io/assets/xxxxx/yyyyy/hoge.jpg" or "https://files.microcms-assets.io/assets/xxxxx/yyyyy/hoge.pdf"). Custom domain URLs are also supported.',
      },
    },
    required: ['url'],
  },
};

export async function handleDeleteMedia(
  params: MediaToolParameters & { url: string },
  serviceId?: string
) {
  const { url } = params;

  if (!url) {
    throw new Error('url is required');
  }

  return await deleteMedia(url, serviceId);
}
