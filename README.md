# microCMS MCP Server

[microCMS](https://microcms.io/) のMCP（Model Context Protocol）サーバーです。  
ClaudeなどのAIアシスタントがmicroCMSのコンテンツ管理システムとやり取りできるようにします。

## 必要なもの

- microCMSのサービスIDとAPIキー

## セットアップ

### 方法1: MCP Bundle (旧DXTファイル) を使う

Claude Desktopに導入する場合、mcpbファイルを使って簡単にインストールできます。

1. [リリースページ](https://github.com/microcmsio/microcms-mcp-server/releases) から最新の `microcms-mcp-server.mcpb` をダウンロード
2. ダウンロードしたmcpbファイルをダブルクリックで開く
3. サービスIDとAPIキーを設定する

### 方法2: npx をつかう（単一サービス）

```json
{
  "mcpServers": {
    "microcms": {
      "command": "npx",
      "args": ["-y", "microcms-mcp-server@latest"],
      "env": {
        "MICROCMS_SERVICE_ID": "<MICROCMS_SERVICE_ID>",
        "MICROCMS_API_KEY": "<MICROCMS_API_KEY>"
      }
    }
  }
}
```

`<MICROCMS_SERVICE_ID>`, `<MICROCMS_API_KEY>` はご自身のものに置き換えてください。

設定更新後はクライアントを再起動してください。

### 方法3: 複数サービスを使う

複数のmicroCMSサービスに接続する場合は、`MICROCMS_SERVICES` 環境変数にJSON形式でサービス情報を設定します。

```json
{
  "mcpServers": {
    "microcms-multi": {
      "command": "npx",
      "args": ["-y", "microcms-mcp-server@latest"],
      "env": {
        "MICROCMS_SERVICES": "[{\"id\":\"blog\",\"apiKey\":\"xxx-api-key\"},{\"id\":\"shop\",\"apiKey\":\"yyy-api-key\"}]"
      }
    }
  }
}
```

#### 複数サービスモードの動作

複数サービスモードでは、各ツールに `serviceId` パラメータが必須になります。

- ツール名は単一サービスモードと同じ `microcms_*` 形式です
- 各ツール呼び出し時に `serviceId` を指定してサービスを選択します
- 設定済みサービスの一覧は `microcms://services` リソースで確認できます

#### 後方互換性

| 設定方法 | モード | serviceIdパラメータ |
|---------|-------|-------------------|
| `MICROCMS_SERVICE_ID` + `MICROCMS_API_KEY` | 単一サービス | 省略可（自動でデフォルトサービスを使用） |
| `MICROCMS_SERVICES` (JSON) | 複数サービス | 必須 |

- 従来の環境変数設定をそのまま使う場合、serviceIdを指定せずに今まで通り動作します
- 両方の設定が存在する場合、`MICROCMS_SERVICES` が優先されます

## 利用方法

microCMSのコンテンツを確認する

```
microCMSの news から最新の記事を10件取得してください
```

microCMSにコンテンツを作成して入稿する

```
MCPサーバーの概要や利用例について調べ、それを1000文字程度でまとめてmicroCMSの blogs に入稿してください
```

microCMSのコンテンツを取得してレビューしてもらう

```
microCMSの xxxxxx のコンテンツを取得して、日本語的におかしい部分があれば指摘して
```

microCMSのメディア一覧に画像をアップロードする

```
次の画像をmicroCMSにアップロードして。

- https://example.com/sample-image-1.png
- https://example.com/sample-image-2.png
- https://example.com/sample-image-3.png
```

### 複数サービスモードでの使用例

複数サービスモードでは、サービスIDを指定して各サービスを操作できます。

```
blogサービスの記事一覧を取得して
```

```
shopサービスに新しい商品を追加して
```

```
blogの最新記事をshopの商品説明にコピーして
```

#### サービス一覧の確認

`microcms://services` リソースを読み取ることで、設定済みサービスと各サービスのAPI（エンドポイント）一覧を確認できます。AIエージェントはこの情報を使って、指定されたendpointがどのサービスに属するか判断できます。

```json
{
  "mode": "multi",
  "description": "Multi service mode - serviceId parameter is required for all tools. Use the serviceId that contains the endpoint you need.",
  "services": [
    {
      "id": "blog",
      "apis": [
        { "name": "ブログ記事", "endpoint": "blogs", "type": "list" },
        { "name": "カテゴリー", "endpoint": "categories", "type": "list" }
      ]
    },
    {
      "id": "shop",
      "apis": [
        { "name": "商品", "endpoint": "products", "type": "list" },
        { "name": "注文", "endpoint": "orders", "type": "list" }
      ]
    }
  ]
}
```

### より詳しい使い方

以下の記事でより詳しい使い方を紹介しています。

- [microCMSのMCPサーバーをリリースしました | microCMSブログ](https://blog.microcms.io/microcms-mcp-server/)
- [MCPサーバーからmicroCMSにコンテンツを入稿する | Zenn](https://zenn.dev/himara2/articles/14eb2260c4f0e4)

## ライセンス

MIT
