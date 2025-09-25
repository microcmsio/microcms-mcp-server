import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getListTool, handleGetList } from './tools/get-list.js';
import { getContentTool, handleGetContent } from './tools/get-content.js';
import { createContentPublishedTool, handleCreateContentPublished } from './tools/create-content-published.js';
import { createContentDraftTool, handleCreateContentDraft } from './tools/create-content-draft.js';
import { updateContentPublishedTool, handleUpdateContentPublished } from './tools/update-content-published.js';
import { updateContentDraftTool, handleUpdateContentDraft } from './tools/update-content-draft.js';
import { patchContentTool, handlePatchContent } from './tools/patch-content.js';
import { deleteContentTool, handleDeleteContent } from './tools/delete-content.js';
import { getMediaTool, handleGetMedia } from './tools/get-media.js';
import { uploadMediaTool, handleUploadMedia } from './tools/upload-media.js';
import { getApiInfoTool, handleGetApiInfo } from './tools/get-api-info.js';
import type { ToolParameters, MediaToolParameters } from './types.js';

const server = new Server(
  {
    name: 'microcms-mcp-server',
    version: '1.0.0',
    description: 'A Model Context Protocol server for microCMS API',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      getListTool,
      getContentTool,
      createContentPublishedTool,
      createContentDraftTool,
      updateContentPublishedTool,
      updateContentDraftTool,
      patchContentTool,
      deleteContentTool,
      getMediaTool,
      uploadMediaTool,
      getApiInfoTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const params = args as unknown as ToolParameters;

  try {
    let result;

    switch (name) {
      case 'microcms_get_list':
        result = await handleGetList(params);
        break;
      case 'microcms_get_content':
        result = await handleGetContent(params);
        break;
      case 'microcms_create_content_published':
        result = await handleCreateContentPublished(params);
        break;
      case 'microcms_create_content_draft':
        result = await handleCreateContentDraft(params);
        break;
      case 'microcms_update_content_published':
        result = await handleUpdateContentPublished(params);
        break;
      case 'microcms_update_content_draft':
        result = await handleUpdateContentDraft(params);
        break;
      case 'microcms_patch_content':
        result = await handlePatchContent(params);
        break;
      case 'microcms_delete_content':
        result = await handleDeleteContent(params);
        break;
      case 'microcms_get_media':
        result = await handleGetMedia(params as unknown as MediaToolParameters);
        break;
      case 'microcms_upload_media':
        result = await handleUploadMedia(params as unknown as MediaToolParameters);
        break;
      case 'microcms_get_api_info':
        result = await handleGetApiInfo(params);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

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
    // Validate configuration early to provide better error messages
    const { parseConfig } = await import('./config.js');
    parseConfig();

    const transport = new StdioServerTransport();
    await server.connect(transport);
    // console.error('microCMS MCP Server running on stdio');
  } catch (error) {
    if (error instanceof Error && error.message.includes('microCMS credentials')) {
      console.error('Configuration Error:', error.message);
      process.exit(1);
    }
    throw error;
  }
}