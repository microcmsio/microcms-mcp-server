import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { create } from '../client.js';
import { FIELD_FORMATS_DESCRIPTION } from '../constants.js';
import type { BulkCreateResult, BulkToolParameters } from '../types.js';

const BULK_DESCRIPTION = `
  Create multiple contents in microCMS at once.
  This tool processes contents sequentially and continues even if some fail.
  Results include success/failure status for each content.

  ${FIELD_FORMATS_DESCRIPTION}
`;

export const createContentsBulkPublishedTool: Tool = {
  name: 'microcms_create_contents_bulk_published',
  description: BULK_DESCRIPTION,
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
      contents: {
        type: 'array',
        description: 'Array of contents to create',
        items: {
          type: 'object',
          properties: {
            content: {
              type: 'object',
              description: 'Content data to create (JSON object)',
            },
            contentId: {
              type: 'string',
              description: 'Specific content ID to assign (optional)',
            },
          },
          required: ['content'],
        },
      },
    },
    required: ['endpoint', 'contents'],
  },
};

export const createContentsBulkDraftTool: Tool = {
  name: 'microcms_create_contents_bulk_draft',
  description: BULK_DESCRIPTION,
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
      contents: {
        type: 'array',
        description: 'Array of contents to create as draft',
        items: {
          type: 'object',
          properties: {
            content: {
              type: 'object',
              description: 'Content data to create (JSON object)',
            },
            contentId: {
              type: 'string',
              description: 'Specific content ID to assign (optional)',
            },
          },
          required: ['content'],
        },
      },
    },
    required: ['endpoint', 'contents'],
  },
};

async function handleBulkCreate(
  params: BulkToolParameters,
  isDraft: boolean,
  serviceId?: string
): Promise<BulkCreateResult> {
  const { endpoint, contents } = params;

  if (!contents || !Array.isArray(contents) || contents.length === 0) {
    throw new Error('contents array is required and must not be empty');
  }

  const results: BulkCreateResult['results'] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < contents.length; i++) {
    const item = contents[i];

    try {
      const createOptions: { isDraft: boolean; contentId?: string } = {
        isDraft,
      };

      if (item.contentId) {
        createOptions.contentId = item.contentId;
      }

      const result = await create(
        endpoint,
        item.content,
        createOptions,
        serviceId
      );

      results.push({
        index: i,
        success: true,
        id: result.id,
      });
      successCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      results.push({
        index: i,
        success: false,
        error: errorMessage,
      });
      failureCount++;
    }
  }

  return {
    totalCount: contents.length,
    successCount,
    failureCount,
    results,
  };
}

export async function handleCreateContentsBulkPublished(
  params: BulkToolParameters,
  serviceId?: string
): Promise<BulkCreateResult> {
  return handleBulkCreate(params, false, serviceId);
}

export async function handleCreateContentsBulkDraft(
  params: BulkToolParameters,
  serviceId?: string
): Promise<BulkCreateResult> {
  return handleBulkCreate(params, true, serviceId);
}
