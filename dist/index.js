#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { getListTool, handleGetList } from './tools/get-list.js';
import { getContentTool, handleGetContent } from './tools/get-content.js';
import { createContentTool, handleCreateContent } from './tools/create-content.js';
import { updateContentTool, handleUpdateContent } from './tools/update-content.js';
import { patchContentTool, handlePatchContent } from './tools/patch-content.js';
import { deleteContentTool, handleDeleteContent } from './tools/delete-content.js';
import { getMediaTool, handleGetMedia } from './tools/get-media.js';
import { uploadMediaTool, handleUploadMedia } from './tools/upload-media.js';
const server = new Server({
    name: 'microcms-mcp-server',
    version: '1.0.0',
    description: 'A Model Context Protocol server for microCMS API',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            getListTool,
            getContentTool,
            createContentTool,
            updateContentTool,
            patchContentTool,
            deleteContentTool,
            getMediaTool,
            uploadMediaTool,
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const params = args;
    try {
        let result;
        switch (name) {
            case 'microcms_get_list':
                result = await handleGetList(params);
                break;
            case 'microcms_get_content':
                result = await handleGetContent(params);
                break;
            case 'microcms_create_content':
                result = await handleCreateContent(params);
                break;
            case 'microcms_update_content':
                result = await handleUpdateContent(params);
                break;
            case 'microcms_patch_content':
                result = await handlePatchContent(params);
                break;
            case 'microcms_delete_content':
                result = await handleDeleteContent(params);
                break;
            case 'microcms_get_media':
                result = await handleGetMedia(params);
                break;
            case 'microcms_upload_media':
                result = await handleUploadMedia(params);
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
    }
    catch (error) {
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
        console.error('microCMS MCP Server running on stdio');
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('microCMS credentials')) {
            console.error('Configuration Error:', error.message);
            process.exit(1);
        }
        throw error;
    }
}
async function main() {
    await startServer();
}
// 直接実行された場合のみサーバーを起動
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Fatal error in main():', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map