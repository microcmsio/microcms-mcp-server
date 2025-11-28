import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { patchContentStatus } from '../client.js';
import type { ToolParameters } from '../types.js';

export const patchContentStatusTool: Tool = {
  name: 'microcms_patch_content_status',
  description:
    'Change content publication status in microCMS (Management API). Can change status between PUBLISH (published) and DRAFT (draft). Note: Only transitions between "published" and "draft" are supported.',
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
        description: 'Content ID to change status',
      },
      status: {
        type: 'string',
        enum: ['PUBLISH', 'DRAFT'],
        description:
          'Target status: "PUBLISH" to publish content, "DRAFT" to set as draft',
      },
    },
    required: ['endpoint', 'contentId', 'status'],
  },
};

export async function handlePatchContentStatus(
  params: ToolParameters & { status: 'PUBLISH' | 'DRAFT' },
  serviceId?: string
) {
  const { endpoint, contentId, status } = params;

  if (!endpoint) {
    throw new Error('endpoint is required');
  }

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (!status || (status !== 'PUBLISH' && status !== 'DRAFT')) {
    throw new Error('status must be either "PUBLISH" or "DRAFT"');
  }

  await patchContentStatus(endpoint, contentId, status, serviceId);
  return { message: `Content ${contentId} status changed to ${status}` };
}
