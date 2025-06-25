import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { microCMSManagementClient } from '../client.js';
import type { MediaToolParameters } from '../types.js';

export const uploadMediaTool: Tool = {
  name: 'microcms_upload_media',
  description: 'Upload media files to microCMS using JS SDK (Management API). Supports two methods: 1) Upload file data (base64) with filename and mimeType, 2) Upload from external URL. Returns microCMS asset URL. Requires media upload permissions. Available on Team, Business, Advanced, and Enterprise plans.',
  inputSchema: {
    type: 'object',
    properties: {
      fileData: {
        type: 'string',
        description: 'Base64 encoded file data (for direct file upload)',
      },
      fileName: {
        type: 'string',
        description: 'File name with extension (e.g., "image.jpg", "document.pdf") - required when using fileData',
      },
      mimeType: {
        type: 'string',
        description: 'MIME type of the file (e.g., "image/jpeg", "application/pdf") - required when using fileData',
      },
      externalUrl: {
        type: 'string',
        description: 'External URL of the file to upload (alternative to fileData)',
      },
    },
  },
};

export async function handleUploadMedia(params: MediaToolParameters) {
  const { fileData, fileName, mimeType, externalUrl } = params;

  try {
    // Method 1: Upload from external URL
    if (externalUrl) {
      const result = await microCMSManagementClient.uploadMedia({
        data: externalUrl,
      });
      return result;
    }

    // Method 2: Upload file data
    if (fileData && fileName && mimeType) {
      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');

      // Check file size (5MB limit)
      if (buffer.length > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      // Create Blob from buffer (for Node.js environment)
      const data = new Blob([buffer], { type: mimeType });

      const result = await microCMSManagementClient.uploadMedia({
        data,
        name: fileName,
      });

      return result;
    }

    throw new Error('Either externalUrl or (fileData + fileName + mimeType) must be provided');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Media upload failed: ${error.message}`);
    }
    throw new Error('Media upload failed: Unknown error');
  }
}