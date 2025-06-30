# microCMS MCP Server

[microCMS](https://microcms.io/) Context Protocol）サーバーです。  
ClaudeなどのAIアシスタントがmicroCMSのコンテンツ管理システムとやり取りできるようにします。


## 必要なもの

- microCMSのサービスIDとAPIキー

## セットアップ

### 方法1: Desktop Extension (DXT)をつかう

Claude Desktopに導入する場合、dxtファイルを使って簡単にインストールできます。

1. [microcms-mcp-server.dxt](https://github.com/himaratsu/microcms-mcp-server/blob/main/microcms-mcp-server.dxt) をダウンロード
2. Claude Desktopを起動し、設定 > エクステンション を開く
3. ダウンロードしたdxtファイルをClaude Desktopにドラッグ＆ドロップ
4. サービスIDとAPIキーを


### 方法2: npx をつかう

```json
{
  "mcpServers": {
    "microcms": {
      "command": "npx",
      "args": [
        "-y",
        "microcms-mcp-server@latest",
        "--service-id", "<MICROCMS_SERVICE_ID>",
        "--api-key", "<MICROCMS_API_KEY>"
      ]
    }
  }
}
```

`MICROCMS_SERVICE_ID`, `MICROCMS_API_KEY` はご自身のものに置き換えてください。

設定更新後、Claude Desktopを再起動してください。

## 利用方法

### 1. 最初にmicroCMSのAPIスキーマを伝える

```
これはmicroCMSのAPIスキーマです。内容を理解してください
```

APIスキーマは [microCMSの管理画面 > API設定](https://document.microcms.io/manual/export-and-import-api-schema) からJSON形式でエクスポートできます。

### 2. microCMSからコンテンツを取得・入稿します

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


### より詳しい使い方

こちらの記事でより詳しい使い方を紹介しています。  
[MCPサーバーからmicroCMSにコンテンツを入稿する | Zenn](https://zenn.dev/himara2/articles/14eb2260c4f0e4)

## ライセンス

MIT
