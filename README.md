# microCMS MCP Server

A Model Context Protocol (MCP) server for microCMS API integration. This server enables AI assistants like Claude to interact with microCMS content management system.

## Features

- **Content Management**: Full CRUD operations for microCMS list-type APIs
- **Eight Core Tools**:
  - `microcms_get_list` - Retrieve content lists with filtering and pagination
  - `microcms_get_content` - Get individual content items
  - `microcms_create_content` - Create new content
  - `microcms_update_content` - Update content (PUT)
  - `microcms_patch_content` - Partially update content (PATCH)
  - `microcms_delete_content` - Delete content
  - `microcms_get_media` - Retrieve media files (Management API)
  - `microcms_upload_media` - Upload media files (Management API)
- **Full API Support**: Supports all microCMS query parameters including drafts, filters, pagination, and depth expansion

## Requirements

- Node.js 18.0.0 or higher
- microCMS account and API key

## Installation

### Method 1: Using npx (Recommended)

No installation required! Use directly with npx:

```bash
npx microcms-mcp-server --service-id your-service-id --api-key your-api-key
```

### Method 2: Global Installation

```bash
npm install -g microcms-mcp-server
microcms-mcp-server --service-id your-service-id --api-key your-api-key
```

### Method 3: Development Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

You can configure microCMS credentials in two ways:

### Method 1: Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure your microCMS credentials in `.env`:
   ```bash
   MICROCMS_SERVICE_ID=your-service-id
   MICROCMS_API_KEY=your-api-key
   ```

### Method 2: Command Line Arguments

Pass credentials directly as command line arguments:
```bash
node dist/index.js --service-id your-service-id --api-key your-api-key
```

**Note**: Command line arguments take precedence over environment variables.

## Usage

### Running the Server

Using environment variables:
```bash
npm start
```

Using command line arguments:
```bash
npm run start:args
# or directly:
node dist/index.js --service-id your-service-id --api-key your-api-key
```

### Using with Claude Desktop

Add the following to your Claude Desktop MCP configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

#### Option 1: Using npx (Recommended)
```json
{
  "mcpServers": {
    "microcms": {
      "command": "npx",
      "args": [
        "microcms-mcp-server",
        "--service-id", "your-service-id",
        "--api-key", "your-api-key"
      ]
    }
  }
}
```

#### Option 2: Using global installation
```json
{
  "mcpServers": {
    "microcms": {
      "command": "microcms-mcp-server",
      "args": [
        "--service-id", "your-service-id",
        "--api-key", "your-api-key"
      ]
    }
  }
}
```

#### Option 3: Using local development setup
```json
{
  "mcpServers": {
    "microcms": {
      "command": "node",
      "args": [
        "/path/to/microcms-mcp-server/dist/index.js",
        "--service-id", "your-service-id",
        "--api-key", "your-api-key"
      ]
    }
  }
}
```

Replace:
- `your-service-id` with your microCMS service ID
- `your-api-key` with your microCMS API key
- `/path/to/microcms-mcp-server/` with the actual path (Option 3 only)

Restart Claude Desktop after updating the configuration.

### Development Mode

```bash
npm run dev
```

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run the compiled server
- `npm run dev` - Development mode with auto-reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Tool Examples

### Get Content List
```json
{
  "name": "microcms_get_list",
  "arguments": {
    "endpoint": "blogs",
    "limit": 10,
    "orders": "-publishedAt"
  }
}
```

### Get Individual Content
```json
{
  "name": "microcms_get_content",
  "arguments": {
    "endpoint": "blogs",
    "contentId": "article-1"
  }
}
```

### Create New Content
```json
{
  "name": "microcms_create_content",
  "arguments": {
    "endpoint": "blogs",
    "content": {
      "title": "My Blog Post",
      "body": "Content here...",
      "category": "tech",
      "thumbnail": "https://example.com/image.jpg"
    }
  }
}
```

### Update Content with Image
```json
{
  "name": "microcms_update_content",
  "arguments": {
    "endpoint": "blogs",
    "contentId": "article-1",
    "content": {
      "title": "Updated Title",
      "image": "https://example.com/new-image.jpg"
    }
  }
}
```

### Get Media Files
```json
{
  "name": "microcms_get_media",
  "arguments": {
    "limit": 20,
    "imageOnly": true,
    "fileName": "sample"
  }
}
```

### Upload Media File (Base64)
```json
{
  "name": "microcms_upload_media",
  "arguments": {
    "fileData": "base64-encoded-file-data",
    "fileName": "image.jpg",
    "mimeType": "image/jpeg"
  }
}
```

### Upload Media File (External URL)
```json
{
  "name": "microcms_upload_media",
  "arguments": {
    "externalUrl": "https://example.com/image.jpg"
  }
}
```

## Field Type Specifications

When creating or updating content, different field types require specific formats:

### Text Fields
```json
"title": "Article Title"
```

### Rich Editor Fields
```json
"body": "<h1>見出し</h1><p>このようにHTMLで入稿できます</p>"
```

### Image Fields
Must use URLs from the same microCMS service:
```json
"thumbnail": "https://images.microcms-assets.io/assets/xxxxxxxx/yyyyyyyy/sample.png"
```

### Multiple Image Fields
```json
"gallery": [
  "https://images.microcms-assets.io/assets/xxxxxxxx/yyyyyyyy/sample1.png",
  "https://images.microcms-assets.io/assets/xxxxxxxx/yyyyyyyy/sample2.png"
]
```

### Date Fields
Use ISO 8601 format:
```json
"publishedAt": "2020-04-23T14:32:38.163Z"
```

### Select Fields
```json
"categories": ["カテゴリ1", "カテゴリ2"]
```

### Content Reference Fields
Single reference:
```json
"relatedArticle": "article-id-123"
```

Multiple references:
```json
"relatedArticles": ["article-id-123", "article-id-456"]
```

### Complete Example
```json
{
  "name": "microcms_create_content",
  "arguments": {
    "endpoint": "blogs",
    "content": {
      "title": "My Blog Post",
      "body": "<h2>Introduction</h2><p>This is a paragraph with <strong>bold text</strong>.</p>",
      "thumbnail": "https://images.microcms-assets.io/assets/xxx/yyy/image.png",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "categories": ["tech", "tutorial"],
      "relatedArticles": ["article-1", "article-2"]
    }
  }
}
```

## Media Management

### Media Retrieval (`microcms_get_media`)
- **API Type**: Management API v2 (direct fetch)
- **Permissions**: Requires "media retrieval" permissions
- **Features**: 
  - Pagination with tokens (15-second validity)
  - Filter by filename
  - Image-only filtering
  - Returns URLs, dimensions, and metadata

### Media Upload (`microcms_upload_media`)
- **API Type**: Management API v1 (via JS SDK)
- **Permissions**: Requires "media upload" permissions
- **Upload Methods**:
  1. **File Data Upload**: Base64 encoded file data with filename and mimeType
  2. **External URL Upload**: Direct upload from external URL
- **Limitations**: 
  - File size: 5MB maximum
  - One file per request
  - Available on Team, Business, Advanced, Enterprise plans
- **Returns**: microCMS asset URLs
  - Images: `https://images.microcms-assets.io/...`
  - Files: `https://files.microcms-assets.io/...`

## API Reference

All tools support the full range of microCMS API parameters. Content tools use the [Content API](https://document.microcms.io/content-api), while media tools use the [Management API](https://document.microcms.io/management-api).

## Error Handling

The server provides detailed error messages for:
- Missing required environment variables
- Invalid API requests
- microCMS API errors
- Malformed tool parameters

## License

MIT