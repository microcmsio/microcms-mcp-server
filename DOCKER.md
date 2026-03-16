# Docker を使ったリモート MCP サーバーの構築と検証

microCMS MCP Server を Docker コンテナとして起動し、HTTP トランスポート経由でリモート MCP サーバーとして利用する手順です。

## 前提条件

- Docker / Docker Compose がインストール済みであること
- Node.js 18+ / pnpm がインストール済みであること（ビルド用）
- microCMS のサービス ID と API キーを取得済みであること

## クイックスタート

### 1. ビルド

Docker イメージはビルド済みの `dist/` ディレクトリを COPY する設計です。先にローカルでビルドしてください。

```bash
pnpm install
pnpm build
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

`.env` を編集し、利用するモードに応じて設定してください。

**単一サービスモード:**

```bash
MICROCMS_SERVICE_ID=your-service-id
MICROCMS_API_KEY=your-api-key
```

**複数サービスモード:**

```bash
MICROCMS_SERVICES=[{"id":"blog","apiKey":"your-blog-api-key"},{"id":"shop","apiKey":"your-shop-api-key"}]
```

**認証トークン（推奨）:**

```bash
MCP_AUTH_TOKEN=your-secret-token
```

### 3. 起動

```bash
# ビルドして起動
docker compose up -d --build

# ログを確認
docker compose logs -f
```

### 4. ヘルスチェック

```bash
# ヘルスチェックエンドポイント
curl http://localhost:3000/health
# → {"status":"ok"}

# コンテナのヘルス状態を確認
docker inspect --format='{{.State.Health.Status}}' microcms-mcp-server-microcms-mcp-1
# → healthy
```

## クライアント接続設定

Docker で起動したリモート MCP サーバーに各クライアントから接続する方法です。

### Claude Desktop

[mcp-remote](https://github.com/geelen/mcp-remote) を使って接続します。

`claude_desktop_config.json` に以下を追加:

```json
{
  "mcpServers": {
    "microcms-remote": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "http://localhost:3000/mcp",
        "--header", "Authorization:${MCP_AUTH_TOKEN}"
      ],
      "env": {
        "MCP_AUTH_TOKEN": "Bearer your-secret-token"
      }
    }
  }
}
```

### Cursor

Cursor の MCP 設定（Settings > MCP Servers）に以下を追加:

```json
{
  "mcpServers": {
    "microcms-remote": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "http://localhost:3000/mcp",
        "--header", "Authorization:${MCP_AUTH_TOKEN}"
      ],
      "env": {
        "MCP_AUTH_TOKEN": "Bearer your-secret-token"
      }
    }
  }
}
```

### Claude Code

Claude Code の設定ファイル（`.mcp.json` または `settings.json`）に以下を追加:

```json
{
  "mcpServers": {
    "microcms-remote": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "http://localhost:3000/mcp",
        "--header", "Authorization:${MCP_AUTH_TOKEN}"
      ],
      "env": {
        "MCP_AUTH_TOKEN": "Bearer your-secret-token"
      }
    }
  }
}
```

### Bearer トークン指定時の注意点

`mcp-remote` の `--header` フラグでは、ヘッダー名と値をコロン（`:`）で区切ります。

```
--header "Authorization:Bearer your-token"
```

**環境変数方式を推奨します。** 理由:

- 設定ファイルにトークンを直書きするリスクを回避できる
- シェルエスケープの問題を避けられる
- 一部のクライアント（Cursor の Windows 版など）で `--header` の値にスペースが含まれる場合のパースバグを回避できる

環境変数方式の設定例:

```json
{
  "args": [
    "-y", "mcp-remote",
    "http://localhost:3000/mcp",
    "--header", "Authorization:${MCP_AUTH_TOKEN}"
  ],
  "env": {
    "MCP_AUTH_TOKEN": "Bearer your-secret-token"
  }
}
```

認証なしで起動する場合は、`MCP_AUTH_TOKEN` を設定せず、`--header` 引数も省略してください。

```json
{
  "args": ["-y", "mcp-remote", "http://localhost:3000/mcp"]
}
```

## 環境変数リファレンス

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `MICROCMS_SERVICE_ID` | - | microCMS サービス ID（単一サービスモード） |
| `MICROCMS_API_KEY` | - | microCMS API キー（単一サービスモード） |
| `MICROCMS_SERVICES` | - | サービス JSON 配列（複数サービスモード、設定時は単一より優先） |
| `MCP_TRANSPORT` | `stdio` | トランスポートモード（Docker では `http` 固定） |
| `MCP_HTTP_PORT` | `3000` | HTTP サーバーのポート番号 |
| `MCP_HTTP_HOST` | `0.0.0.0` | HTTP サーバーのバインドアドレス |
| `MCP_AUTH_TOKEN` | - | Bearer 認証トークン（未設定の場合、認証なし） |

## トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker compose logs microcms-mcp

# よくある原因
# - dist/ が存在しない → pnpm build を実行
# - 環境変数が未設定 → .env ファイルを確認
# - ポートが競合 → MCP_HTTP_PORT を変更
```

### 接続できない

```bash
# コンテナが起動しているか確認
docker compose ps

# ヘルスチェック
curl -v http://localhost:3000/health

# ポートマッピングの確認
docker compose port microcms-mcp 3000

# ファイアウォールの確認（Linux）
sudo ss -tlnp | grep 3000
```

### 認証エラー

```bash
# MCP_AUTH_TOKEN が正しく設定されているか確認
docker compose exec microcms-mcp printenv MCP_AUTH_TOKEN

# ヘッダーの形式を確認（コロンの直後にスペースを入れない）
# ✅ Authorization:Bearer your-token
# ❌ Authorization: Bearer your-token
# ❌ Authorization:bearer your-token（大文字小文字に注意）
```

### mcp-remote のセッション関連

`mcp-remote` はセッション管理のために `mcp-session-id` ヘッダーを自動的に付与します。サーバー側のセッションは 30 分でタイムアウトし、自動的にクリーンアップされます。

セッション切断時のエラーが発生した場合は、クライアント側で MCP サーバーを再接続してください。

## 本番環境への展開（参考）

### HTTPS の設定

本番環境では HTTPS を使用してください。直接 TLS を終端するのではなく、リバースプロキシの利用を推奨します。

```
[Client] → HTTPS → [Nginx/Caddy] → HTTP → [microcms-mcp:3000]
```

Caddy を使った例:

```
mcp.example.com {
    reverse_proxy microcms-mcp:3000
}
```

### セキュリティ考慮事項

- `MCP_AUTH_TOKEN` には十分な長さのランダム文字列を使用してください
- コンテナは非 root ユーザー（`node`）で実行されます
- API キーはコンテナの環境変数として渡されます。Docker secrets や外部シークレット管理の利用も検討してください
- 不要なポートを外部に公開しないよう、ファイアウォールで制限してください
