import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getClientsForService } from '../client.js';
import type { MediaToolParameters } from '../types.js';

export const getMediaTool: Tool = {
  name: 'microcms_get_media',
  description:
    'Get media files from microCMS (Management API). Returns media information including URLs, dimensions for images. Supports pagination via token (15-second validity). Requires media retrieval permissions.',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description:
          'Service ID (required in multi-service mode, optional in single-service mode)',
      },
      limit: {
        type: 'number',
        description:
          'Number of media to retrieve (max 100, default 10). Only valid on first request.',
        minimum: 1,
        maximum: 100,
      },
      imageOnly: {
        type: 'boolean',
        description:
          'Set to true to retrieve only image files. Only valid on first request.',
      },
      fileName: {
        type: 'string',
        description:
          'Filter media by partial filename match (includes file extension)',
      },
      token: {
        type: 'string',
        description:
          'Continuation token for pagination (obtained from previous response, 15-second validity)',
      },
    },
    required: [],
  },
};

export async function handleGetMedia(
  params: MediaToolParameters,
  serviceId?: string
) {
  const clients = getClientsForService(serviceId);
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.imageOnly) queryParams.append('imageOnly', 'true');
  if (params.fileName) queryParams.append('fileName', params.fileName);
  if (params.token) queryParams.append('token', params.token);

  const response = await fetch(
    `https://${clients.serviceDomain}.microcms-management.io/api/v2/media?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'X-MICROCMS-API-KEY': clients.apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Media retrieval failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}
