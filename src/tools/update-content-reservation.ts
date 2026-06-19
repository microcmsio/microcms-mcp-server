import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { updateContentReservation } from '../client.js';
import type { ToolParameters } from '../types.js';

export const updateContentReservationTool: Tool = {
  name: 'microcms_update_content_reservation',
  description:
    'Set or clear content publish/stop reservation schedules in microCMS (Management API). Provide publishTime and/or stopTime as ISO 8601 strings. If neither is provided, existing publish and stop reservations are cleared.',
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
        description: 'Content ID to update reservation schedules',
      },
      publishTime: {
        type: 'string',
        description:
          'Publish reservation time as an ISO 8601 string (e.g., "2026-01-14T15:31:24.668+09:00" or "2026-01-14T06:31:24.668Z"). Omit to clear any existing publish reservation.',
      },
      stopTime: {
        type: 'string',
        description:
          'Stop reservation time as an ISO 8601 string (e.g., "2026-01-14T15:31:24.668+09:00" or "2026-01-14T06:31:24.668Z"). Omit to clear any existing stop reservation.',
      },
    },
    required: ['endpoint', 'contentId'],
  },
};

export async function handleUpdateContentReservation(
  params: ToolParameters,
  serviceId?: string
) {
  const { endpoint, contentId, publishTime, stopTime } = params;

  if (!endpoint) {
    throw new Error('endpoint is required');
  }

  if (!contentId) {
    throw new Error('contentId is required');
  }

  if (publishTime === '' || stopTime === '') {
    throw new Error('publishTime and stopTime must not be empty strings');
  }

  const reservation: { publishTime?: string; stopTime?: string } = {};
  if (publishTime !== undefined) {
    reservation.publishTime = publishTime;
  }
  if (stopTime !== undefined) {
    reservation.stopTime = stopTime;
  }

  const result = await updateContentReservation(
    endpoint,
    contentId,
    reservation,
    serviceId
  );

  if (!publishTime && !stopTime) {
    return {
      message: `Content ${contentId} reservation schedules cleared`,
      id: result.id,
    };
  }

  return {
    message: `Content ${contentId} reservation schedules updated`,
    id: result.id,
  };
}
