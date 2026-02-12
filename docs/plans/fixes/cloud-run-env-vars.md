---
fix: Cloud Run環境変数設定
type: fix
created: 2026-02-12
status: investigating
---

# 修正計画: Cloud Run環境変数設定

## エラー内容
- メッセージ: "Google認証エラー: Supabase environment variables are missing. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
- 発生箇所: Cloud Run デプロイ後のログインページ

## 原因分析
- 推定原因: cloudbuild.yaml で環境変数を --set-env-vars で設定しているが、NEXT_PUBLIC_* 変数はビルド時に必要。Cloud Run の実行時環境変数では Next.js に読み込まれない。

## 修正方針
- Docker ビルド時に --build-arg で環境変数を渡す
- または Dockerfile で ARG を定義して ENV に設定

## 修正対象ファイル
- cloudbuild.yaml
- Dockerfile (必要に応じて)
