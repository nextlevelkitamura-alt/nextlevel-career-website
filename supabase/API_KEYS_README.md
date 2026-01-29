# Supabase MCP Setup

このプロジェクトでは、AIがデータベース構造を理解し、SQL生成を行うために **Supabase MCP Server** を使用します。

## 🔐 セキュリティ設定
APIキーなどの機密情報は、**`.env.local`** ファイル内に環境変数として保存されています。
このファイルは `.gitignore` に含まれており、GitHub等にはアップロードされません。

## 📍 参照先
AIエージェントは以下の変数を参照してセットアップを行います。

- **Project URL**: `SUPABASE_URL` (in .env.local)
- **Service Key**: `SUPABASE_SERVICE_ROLE_KEY` (in .env.local)
- **Anon Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (in .env.local) - For Client/Browser

## 🛠 接続設定 (Cursor / Windsurf)
MCPサーバーを追加する際は、以下の設定を使用してください。

- **Type**: `command`
- **Command**: `npx -y @supabase/mcp-server`
- **Environment Variables**:
    - `SUPABASE_URL`: (上記のURL)
    - `SUPABASE_SERVICE_KEY`: (上記のKey)

## ⚠️ 注意
`SUPABASE_SERVICE_ROLE_KEY` は **管理者権限** を持ちます。
絶対に公開リポジトリにコミットしたり、クライアントサイド（ブラウザ用コード）で使用しないでください。
