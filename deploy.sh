#!/bin/bash
# デプロイスクリプト
# 使い方: ./deploy.sh
# 事前に .env.local にシークレット（GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY）を設定しておくこと

set -e

PROJECT_ID="shikumika-app"
REGION="asia-northeast1"

# .env.local からシークレットを読み込む
if [ ! -f .env.local ]; then
  echo "ERROR: .env.local が見つかりません"
  exit 1
fi

GEMINI_API_KEY=$(grep "^GEMINI_API_KEY=" .env.local | cut -d'=' -f2-)
SUPABASE_SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'=' -f2-)

if [ -z "$GEMINI_API_KEY" ]; then
  echo "ERROR: GEMINI_API_KEY が .env.local に設定されていません"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "WARNING: SUPABASE_SERVICE_ROLE_KEY が .env.local に設定されていません（空で続行）"
fi

echo "Cloud Build でビルド & デプロイ開始..."
echo "プロジェクト: $PROJECT_ID"
echo "リージョン: $REGION"

gcloud builds submit \
  --config cloudbuild.yaml \
  --project "$PROJECT_ID" \
  --substitutions "_GEMINI_API_KEY=${GEMINI_API_KEY},_SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"

echo "✅ デプロイ完了!"
echo "URL: https://nextlevel-career-site-466617344999.asia-northeast1.run.app"
