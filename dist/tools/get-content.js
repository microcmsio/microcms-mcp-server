import { getListDetail } from '../client.js';
export const getContentTool = {
    name: 'microcms_get_content',
    description: 'Get a specific content from microCMS',
    inputSchema: {
        type: 'object',
        properties: {
            endpoint: {
                type: 'string',
                description: 'Content type name (e.g., "blogs", "news")',
            },
            contentId: {
                type: 'string',
                description: 'Content ID to retrieve',
            },
            draftKey: {
                type: 'string',
                description: 'Draft key for preview',
            },
            fields: {
                type: 'string',
                description: 'Comma-separated list of fields to retrieve',
            },
            depth: {
                type: 'number',
                description: 'Depth of reference expansion (1-3)',
                minimum: 1,
                maximum: 3,
            },
        },
        required: ['endpoint', 'contentId'],
    },
};
export async function handleGetContent(params) {
    const { endpoint, contentId, ...options } = params;
    if (!contentId) {
        throw new Error('contentId is required');
    }
    const queries = {};
    if (options.draftKey)
        queries.draftKey = options.draftKey;
    if (options.fields)
        queries.fields = options.fields;
    if (options.depth)
        queries.depth = options.depth;
    return await getListDetail(endpoint, contentId, queries);
}
//# sourceMappingURL=get-content.js.map