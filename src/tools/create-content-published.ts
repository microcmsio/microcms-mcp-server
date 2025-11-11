import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { create } from '../client.js';
import type { ToolParameters, MicroCMSCreateOptions } from '../types.js';

export const createContentPublishedTool: Tool = {
  name: 'microcms_create_content_published',
  description: `
  Create new content in microCMS and publish it immediately. 

  ## Important
  Ensure that the "content" you submit strictly adheres to the following specifications.
  In particular, take extra care when handling custom fields, as mistakes are common in their structure. 
  Read the instructions thoroughly and construct the data precisely as described.
  
  ## Field type specifications
  
  * Image fields require URLs from the same microCMS service (e.g., "https://images.microcms-assets.io/assets/xxx/yyy/sample.png"), only the URL string is required. 
  * Multiple image fields use array format. 
  * Rich editor fields expect HTML strings. 
  * Date fields use ISO 8601 format. 
  * Select fields use arrays. 
  * Content reference fields use contentId strings or arrays for multiple references, and you can get contentIds from microcms_get_list tool. 
  * Custom field exepect below struct:
  \`\`\`json
  <field Id in apiFields> {
    "fieldId": "<target custom field id in customFields>"
    "key1": "<value1>",
    "key2": "<value2>",
  }
  \`\`\`
  `,
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'Content type name (e.g., "blogs", "news")',
      },
      content: {
        type: 'object',
        description: `Content data to create (JSON object). Field formats: text="string", richEditor="<h1>HTML</h1>", image="https://images.microcms-assets.io/...", multipleImages=["url1","url2"], date="2020-04-23T14:32:38.163Z", select=["option1","option2"], contentReference="contentId" or ["id1","id2"], custom field expect below struct
        \`\`\`json
        <field Id in apiFields> {
          "fieldId": "<target custom field id in customFields>"
          "key1": "<value1>",
          "key2": "<value2>",
        }
        \`\`\`
        `,
      },
      contentId: {
        type: 'string',
        description: 'Specific content ID to assign',
      },
    },
    required: ['endpoint', 'content'],
  },
};

export async function handleCreateContentPublished(params: ToolParameters) {
  const { endpoint, content, ...options } = params;

  if (!content) {
    throw new Error('content is required');
  }

  const createOptions: MicroCMSCreateOptions = {
    isDraft: false, // Always publish
  };

  if (options.contentId) createOptions.contentId = options.contentId;

  return await create(endpoint, content, createOptions);
}