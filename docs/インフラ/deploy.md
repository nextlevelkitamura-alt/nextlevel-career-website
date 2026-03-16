# デプロイ手順

## 概要

| 項目 | 内容 |
|------|------|
| ホスティング | Google Cloud Run |
| プロジェクト | shikumika-app |
| リージョン | asia-northeast1 |
| 本番URL | https://nextlevelcareer-official.com/ |
| Cloud Run URL | https://nextlevel-career-site-466617344999.asia-northeast1.run.app |

---

## 通常のデプロイ手順

### Claude Code から（推奨）

```
/push --deploy
```

変更のコミット・プッシュ・デプロイを一括で実行します。

### 手動でデプロイする場合

```bash
# 1. コミット＆プッシュ
git add -A
git commit -m "fix: 変更内容"
git push origin main

# 2. デプロイ実行（約4〜5分）
./deploy.sh
```

---

## deploy.sh の仕組み

1. `.env.local` から以下のシークレットを読み込む
   - `GEMINI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CALCOM_WEBHOOK_SECRET`
2. `gcloud builds submit` でCloud Buildにソースを送信
3. Cloud BuildがDockerイメージをビルドしてCloud Runにデプロイ

> **注意**: `gcloud run deploy --source .` は使わないこと。`NEXT_PUBLIC_*` 環境変数がビルドに渡されない。

---

## 前提条件

### `.env.local` に必要な変数

```
GEMINI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CALCOM_WEBHOOK_SECRET=...        # なくても動作する（署名検証なし）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://nextlevelcareer-official.com
```

### gcloud 認証

```bash
gcloud auth login
gcloud config set project shikumika-app
```

---

## デプロイ後の確認

```bash
# ログ確認
gcloud run services logs read nextlevel-career-site \
  --region asia-northeast1 --limit 50

# サービスの状態確認
gcloud run services describe nextlevel-career-site \
  --region asia-northeast1
```

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `.env.local が見つかりません` | ファイルがない | `.env.local` を作成する |
| `GEMINI_API_KEY が設定されていません` | 変数が未設定 | `.env.local` に追記 |
| ビルドエラー（型エラーなど） | TypeScriptエラー | `npm run build` でローカル確認してから再デプロイ |
| デプロイ後に画面が崩れる | 環境変数の不足 | Cloud Runの環境変数設定を確認 |

---

## 関連ドキュメント

- [deployment-setup.md](./deployment-setup.md) — 初期CI/CD設定手順
- [cloudbuild.yaml](../../cloudbuild.yaml) — Cloud Buildの設定ファイル
- [deploy.sh](../../deploy.sh) — デプロイスクリプト本体
