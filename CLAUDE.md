# microCMS MCP Server

microCMSのコンテンツを管理するMCPサーバー

## プロジェクト概要

このプロジェクトは、microCMSのリスト形式APIおよびマネジメントAPIを操作するためのModel Context Protocol (MCP) サーバーです。microCMS JS SDKを活用し、Claude等のAIアシスタントがmicroCMSのコンテンツとメディア管理を完全にサポートします。

## 技術スタック

- **言語**: TypeScript
- **パッケージマネージャー**: npm
- **主要依存関係**:
  - `@modelcontextprotocol/sdk` - MCPサーバー実装
  - `microcms-js-sdk` - microCMS API操作

## 機能

### サポートするツール（8つ）

**コンテンツAPI:**
1. **microcms_get_list** - コンテンツ一覧取得
2. **microcms_get_content** - 個別コンテンツ取得
3. **microcms_create_content** - コンテンツ作成
4. **microcms_update_content** - コンテンツ更新（PUT）
5. **microcms_patch_content** - コンテンツ部分更新（PATCH）
6. **microcms_delete_content** - コンテンツ削除

**マネジメントAPI:**
7. **microcms_get_media** - メディアファイル一覧取得
8. **microcms_upload_media** - メディアファイルアップロード

### 設定方法

**環境変数:**
```bash
MICROCMS_SERVICE_DOMAIN=your-service-name
MICROCMS_API_KEY=your-api-key
```

**コマンドライン引数:**
```bash
node dist/index.js --service-domain your-service-name --api-key your-api-key
```

**Claude Desktop設定:**
```json
{
  "mcpServers": {
    "microcms-args": {
      "comment": "Using command line arguments",
      "command": "node",
      "args": [
        "/path/to/microcms-mcp-server/dist/index.js",
        "--service-domain", "your-service-name",
        "--api-key", "your-api-key"
      ]
    }
  }
}
```

## 実装要件

### ツール仕様

#### 1. microcms_get_list
**説明**: コンテンツ一覧を取得
**パラメータ**:
- `endpoint` (required): コンテンツタイプ名
- `draftKey` (optional): 下書きキー
- `limit` (optional): 取得件数制限 (1-100)
- `offset` (optional): 取得開始位置
- `orders` (optional): ソート順指定
- `q` (optional): 全文検索クエリ
- `fields` (optional): 取得フィールド指定
- `ids` (optional): ID指定での複数取得
- `filters` (optional): フィルター条件
- `depth` (optional): 参照の展開深度 (1-3)

#### 2. microcms_get_content
**説明**: 個別コンテンツを取得
**パラメータ**:
- `endpoint` (required): コンテンツタイプ名
- `contentId` (required): コンテンツID
- `draftKey` (optional): 下書きキー
- `fields` (optional): 取得フィールド指定
- `depth` (optional): 参照の展開深度 (1-3)

#### 3. microcms_create_content
**説明**: 新しいコンテンツを作成
**パラメータ**:
- `endpoint` (required): コンテンツタイプ名
- `content` (required): コンテンツデータ（JSON）
- `isDraft` (optional): 下書きとして保存
- `contentId` (optional): 指定ID作成

#### 4. microcms_update_content
**説明**: コンテンツを完全更新（PUT）
**パラメータ**:
- `endpoint` (required): コンテンツタイプ名
- `contentId` (required): コンテンツID
- `content` (required): 更新するコンテンツデータ（JSON）
- `isDraft` (optional): 下書きとして保存

#### 5. microcms_patch_content
**説明**: コンテンツを部分更新（PATCH）
**パラメータ**:
- `endpoint` (required): コンテンツタイプ名
- `contentId` (required): コンテンツID
- `content` (required): 更新するフィールドのみ（JSON）
- `isDraft` (optional): 下書きとして保存

#### 6. microcms_delete_content
**説明**: コンテンツを削除
**パラメータ**:
- `endpoint` (required): コンテンツタイプ名
- `contentId` (required): コンテンツID

#### 7. microcms_get_media
**説明**: メディアファイル一覧を取得
**パラメータ**:
- `limit` (optional): 取得件数制限 (1-100)
- `imageOnly` (optional): 画像ファイルのみ取得
- `fileName` (optional): ファイル名による部分検索
- `token` (optional): ページネーション用トークン (15秒有効)

#### 8. microcms_upload_media
**説明**: メディアファイルをアップロード
**パラメータ**:
- **方法1**: `fileData` + `fileName` + `mimeType` (Base64アップロード)
- **方法2**: `externalUrl` (外部URLからアップロード)

### エラーハンドリング

- microCMS APIのエラーレスポンスを適切にMCPエラーとして返す
- 必須環境変数の不足時は初期化エラーとする
- 不正なパラメータは適切なエラーメッセージを返す

### ファイル構成

```
microcms-mcp-server/
├── src/
│   ├── index.ts          # MCPサーバーのエントリーポイント
│   ├── config.ts         # 設定管理
│   ├── client.ts         # microCMSクライアント初期化
│   ├── types.ts          # 型定義
│   └── tools/            # 各MCPツールの実装
│       ├── get-list.ts
│       ├── get-content.ts
│       ├── create-content.ts
│       ├── update-content.ts
│       ├── patch-content.ts
│       ├── delete-content.ts
│       ├── get-media.ts
│       └── upload-media.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── .env.example
└── mcp-config-sample.json  # Claude Desktop設定例
```

### 開発・ビルド設定

- TypeScriptコンパイル設定
- ESLint + Prettier設定
- npm scripts:
  - `build`: TypeScriptコンパイル
  - `start`: 本番実行
  - `dev`: 開発モード実行
  - `lint`: コード品質チェック

### 参考API仕様

**コンテンツAPI:**
- [コンテンツ一覧取得](https://document.microcms.io/content-api/get-list-contents)
- [コンテンツ取得](https://document.microcms.io/content-api/get-content)
- [コンテンツ作成](https://document.microcms.io/content-api/post-content)
- [コンテンツ更新](https://document.microcms.io/content-api/put-content)
- [コンテンツ部分更新](https://document.microcms.io/content-api/patch-content)
- [コンテンツ削除](https://document.microcms.io/content-api/delete-content)

**マネジメントAPI:**
- [メディア取得](https://document.microcms.io/management-api/get-media-v2)
- [メディアアップロード](https://document.microcms.io/management-api/post-media)
- [JS SDK メディアアップロード](https://blog.microcms.io/js-sdk-management-api-upload-media/)

## 使用例

```bash
# 環境変数設定
export MICROCMS_SERVICE_DOMAIN=my-blog
export MICROCMS_API_KEY=your-api-key

# MCPサーバー起動
npm start
```

MCPクライアント（Claude等）から使用:
- ブログ記事一覧取得: `microcms_get_list` (endpoint: "blogs")
- 個別記事取得: `microcms_get_content` (endpoint: "blogs", contentId: "article-1")
- 新規記事作成: `microcms_create_content` (endpoint: "blogs", content: {...})
- メディア取得: `microcms_get_media` (limit: 10, imageOnly: true)
- メディアアップロード: `microcms_upload_media` (fileData: "...", fileName: "image.jpg")

## フィールドタイプ対応

- **テキスト**: 文字列
- **リッチエディタ**: HTML文字列
- **画像**: microCMS asset URL文字列
- **複数画像**: URL文字列の配列
- **日付**: ISO 8601形式
- **選択**: 文字列配列
- **コンテンツ参照**: contentId文字列または配列

## 注意事項

- リスト形式APIのみサポート（オブジェクト形式APIは未対応）
- メディアアップロードは5MB制限
- APIレート制限はmicroCMS側の制限に準拠
- .envファイルには機密情報を含むため、Git管理対象外