import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getMember } from '../client.js';
import type { ToolParameters } from '../types.js';

export const getMemberTool: Tool = {
  name: 'microcms_get_member',
  description:
    'Get a specific member from microCMS Management API. Returns member information including ID, name, email, and MFA status.',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description:
          'Service ID (required in multi-service mode, optional in single-service mode)',
      },
      memberId: {
        type: 'string',
        description: 'Member ID to retrieve',
      },
    },
    required: ['memberId'],
  },
};

export async function handleGetMember(
  params: ToolParameters & { memberId: string },
  serviceId?: string
) {
  const { memberId } = params;

  return await getMember(memberId, serviceId);
}
