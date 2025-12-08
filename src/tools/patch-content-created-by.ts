import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { patchContentCreatedBy } from '../client.js';
import type { ToolParameters } from '../types.js';

export const patchContentCreatedByTool: Tool = {
  name: 'microcms_patch_content_created_by',
  description:
    'Change content creator in microCMS (Management API). Updates the createdBy field of a content item to a specified member ID. Member ID can be found in the member detail screen in the management console.',
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
        description: 'Content ID to change creator',
      },
      createdBy: {
        type: 'string',
        description:
          'Member ID to set as the creator. Member ID can be found in the member detail screen in the management console.',
      },
    },
    required: ['endpoint', 'contentId', 'createdBy'],
  },
};

export async function handlePatchContentCreatedBy(
  params: ToolParameters & { createdBy: string },
  serviceId?: string
) {
  const { endpoint, contentId, createdBy } = params;

  if (!endpoint) {
    throw new Error('endpoint is required');
  }

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (!createdBy) {
    throw new Error('createdBy is required');
  }

  const result = await patchContentCreatedBy(
    endpoint,
    contentId,
    createdBy,
    serviceId
  );
  return {
    message: `Content ${contentId} creator changed to ${createdBy}`,
    id: result.id,
  };
}
