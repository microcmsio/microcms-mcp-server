import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  getApiList,
  getAppConfig,
  getServiceIds,
  initializeClients,
} from './client.js';
// Import tool definitions and handlers
import {
  createContentDraftTool,
  handleCreateContentDraft,
} from './tools/create-content-draft.js';
import {
  createContentPublishedTool,
  handleCreateContentPublished,
} from './tools/create-content-published.js';
import {
  deleteContentTool,
  handleDeleteContent,
} from './tools/delete-content.js';
import { deleteMediaTool, handleDeleteMedia } from './tools/delete-media.js';
import { getApiInfoTool, handleGetApiInfo } from './tools/get-api-info.js';
import { getApiListTool, handleGetApiList } from './tools/get-apis-list.js';
import { getContentTool, handleGetContent } from './tools/get-content.js';
import {
  getContentMetaTool,
  handleGetContentMeta,
} from './tools/get-content-meta.js';
import { getListTool, handleGetList } from './tools/get-list.js';
import { getListMetaTool, handleGetListMeta } from './tools/get-list-meta.js';
import { getMediaTool, handleGetMedia } from './tools/get-media.js';
import { getMemberTool, handleGetMember } from './tools/get-member.js';
import { getServicesTool, handleGetServices } from './tools/get-services.js';
import { handlePatchContent, patchContentTool } from './tools/patch-content.js';
import {
  handlePatchContentCreatedBy,
  patchContentCreatedByTool,
} from './tools/patch-content-created-by.js';
import {
  handlePatchContentStatus,
  patchContentStatusTool,
} from './tools/patch-content-status.js';
import {
  handleUpdateContentDraft,
  updateContentDraftTool,
} from './tools/update-content-draft.js';
import {
  handleUpdateContentPublished,
  updateContentPublishedTool,
} from './tools/update-content-published.js';
import { handleUploadMedia, uploadMediaTool } from './tools/upload-media.js';
import type { ToolParameters } from './types.js';

// Fixed tool list (19 tools)
const tools = [
  getServicesTool,
  getListTool,
  getListMetaTool,
  getContentTool,
  getContentMetaTool,
  createContentPublishedTool,
  createContentDraftTool,
  updateContentPublishedTool,
  updateContentDraftTool,
  patchContentTool,
  patchContentStatusTool,
  patchContentCreatedByTool,
  deleteContentTool,
  getMediaTool,
  uploadMediaTool,
  deleteMediaTool,
  getApiInfoTool,
  getApiListTool,
  getMemberTool,
];

// Tool handlers map - using 'any' for generic handler type that accepts multiple tool parameter types
const toolHandlers: Record<
  string,
  (
    // biome-ignore lint/suspicious/noExplicitAny: Generic handler type for multiple tools
    params: any,
    serviceId?: string
    // biome-ignore lint/suspicious/noExplicitAny: Generic return type for multiple tools
  ) => Promise<any>
> = {
  microcms_get_services: handleGetServices,
  microcms_get_list: handleGetList,
  microcms_get_list_meta: handleGetListMeta,
  microcms_get_content: handleGetContent,
  microcms_get_content_meta: handleGetContentMeta,
  microcms_create_content_published: handleCreateContentPublished,
  microcms_create_content_draft: handleCreateContentDraft,
  microcms_update_content_published: handleUpdateContentPublished,
  microcms_update_content_draft: handleUpdateContentDraft,
  microcms_patch_content: handlePatchContent,
  microcms_patch_content_status: handlePatchContentStatus,
  microcms_patch_content_created_by: handlePatchContentCreatedBy,
  microcms_delete_content: handleDeleteContent,
  microcms_get_media: handleGetMedia,
  microcms_upload_media: handleUploadMedia,
  microcms_delete_media: handleDeleteMedia,
  microcms_get_api_info: handleGetApiInfo,
  microcms_get_api_list: handleGetApiList,
  microcms_get_member: handleGetMember,
};

const server = new Server(
  {
    name: 'microcms-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'microcms://services',
        name: 'Available microCMS Services',
        description:
          'List of configured microCMS services. In multi-service mode, use serviceId parameter in tools to specify which service to use.',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'microcms://services') {
    const config = getAppConfig();

    // Helper function to fetch API list for a service
    const fetchApisForService = async (
      serviceId: string
    ): Promise<{ name: string; endpoint: string; type: string }[]> => {
      try {
        const result = await getApiList(serviceId);
        if (result && Array.isArray(result.apis)) {
          return result.apis.map(
            (api: {
              apiName?: string;
              name?: string;
              apiEndpoint?: string;
              endpoint?: string;
              apiType?: string[];
              type?: string;
            }) => ({
              name: api.apiName || api.name || '',
              endpoint: api.apiEndpoint || api.endpoint || '',
              type:
                api.type === 'list' ||
                (Array.isArray(api.apiType) && api.apiType.includes('LIST'))
                  ? 'list'
                  : 'object',
            })
          );
        }
        return [];
      } catch {
        return [];
      }
    };

    let content: object;
    if (config.mode === 'single') {
      const apis = await fetchApisForService(config.serviceDomain);
      content = {
        mode: 'single',
        description: 'Single service mode - serviceId parameter is optional',
        services: [
          {
            id: config.serviceDomain,
            apis,
          },
        ],
      };
    } else {
      // Fetch APIs for all services in parallel
      const servicesWithApis = await Promise.all(
        config.services.map(async (s) => {
          const apis = await fetchApisForService(s.id);
          return {
            id: s.id,
            apis,
          };
        })
      );

      content = {
        mode: 'multi',
        description:
          'Multi service mode - serviceId parameter is required for all tools. Use the serviceId that contains the endpoint you need.',
        services: servicesWithApis,
      };
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(content, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const params = args as unknown as ToolParameters & { serviceId?: string };

  try {
    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Extract serviceId from params and pass to handler
    const { serviceId, ...restParams } = params;
    const result = await handler(restParams, serviceId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

export async function startServer() {
  try {
    // Initialize clients and get configuration
    const config = initializeClients();

    // Log mode information
    if (config.mode === 'single') {
      console.error(
        `microCMS MCP Server starting in single-service mode (service: ${config.serviceDomain})`
      );
    } else {
      const serviceIds = getServiceIds().join(', ');
      console.error(
        `microCMS MCP Server starting in multi-service mode (services: ${serviceIds})`
      );
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('microCMS credentials') ||
        error.message.includes('MICROCMS_SERVICES'))
    ) {
      console.error('Configuration Error:', error.message);
      process.exit(1);
    }
    throw error;
  }
}
