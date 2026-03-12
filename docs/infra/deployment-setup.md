# Google Cloud Run デプロイ設定ガイド

このガイドでは、GitHub ActionsからGoogle Cloud Runへの自動デプロイを設定します。

## 前提条件

- gcloud CLIがインストール済み
- GCPプロジェクトが作成済み
- GitHubリポジトリへのアクセス権限

---

## Step 1: GCPプロジェクトの準備

### 1.1 プロジェクトIDを確認

```bash
# プロジェクト一覧を表示
gcloud projects list

# 使用するプロジェクトを選択
gcloud config set project PROJECT_ID

# 現在のプロジェクトIDを確認
gcloud config get-value project
```

### 1.2 必要なAPIを有効化

```bash
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    iamcredentials.googleapis.com \
    cloudresourcemanager.googleapis.com
```

---

## Step 2: Secret Managerに環境変数を登録

### 2.1 秘密情報を登録

```bash
# Supabase Service Role Key
gcloud secrets create supabase-service-role-key \
    --data-file=<(echo -n "YOUR_SUPABASE_SERVICE_ROLE_KEY")

# Gemini API Key
gcloud secrets create gemini-api-key \
    --data-file=<(echo -n "YOUR_GEMINI_API_KEY")

# Resend API Key
gcloud secrets create resend-api-key \
    --data-file=<(echo -n "YOUR_RESEND_API_KEY")
```

### 2.2 登録確認

```bash
gcloud secrets list
```

---

## Step 3: Workload Identity連携の設定

GitHub ActionsからGCPに安全に認証するために、Workload Identity連携を設定します。

### 3.1 サービスアカウントを作成

```bash
# サービスアカウント名を設定
export SERVICE_ACCOUNT_NAME="github-actions-deploy"
export PROJECT_ID=$(gcloud config get-value project)

# サービスアカウントを作成
gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
    --display-name="GitHub Actions Deploy" \
    --description="Service account for GitHub Actions to deploy to Cloud Run"
```

### 3.2 サービスアカウントに権限を付与

```bash
# Cloud Run管理者権限
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# サービスアカウントユーザー権限
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Secret Managerアクセス権限
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Container Registryへのアクセス権限
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

### 3.3 Workload Identity Poolを作成

```bash
# Workload Identity Poolを作成
gcloud iam workload-identity-pools create "github-pool" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --display-name="GitHub Actions Pool"

# Workload Identity Pool Providerを作成
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3.4 GitHubリポジトリとサービスアカウントを紐付け

```bash
# GitHubのユーザー名とリポジトリ名を設定
export GITHUB_REPO="YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"

# サービスアカウントにWorkload Identity Userロールを付与
gcloud iam service-accounts add-iam-policy-binding \
    "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project="${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_REPO}"
```

### 3.5 Workload Identity Provider URIを取得

```bash
# 以下のコマンドでWorkload Identity Provider URIを取得
gcloud iam workload-identity-pools providers describe "github-provider" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --format="value(name)"
```

**この値をコピーして、次のステップでGitHub Secretsに登録します。**

---

## Step 4: GitHub Secretsに登録

GitHubリポジトリの Settings → Secrets and variables → Actions で以下のシークレットを追加します。

### 必須のシークレット

1. **GCP_PROJECT_ID**
   - 値: あなたのGCPプロジェクトID
   - 確認: `gcloud config get-value project`

2. **GCP_WORKLOAD_IDENTITY_PROVIDER**
   - 値: Step 3.5で取得したWorkload Identity Provider URI
   - 形式: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

3. **GCP_SERVICE_ACCOUNT**
   - 値: サービスアカウントのメールアドレス
   - 形式: `github-actions-deploy@PROJECT_ID.iam.gserviceaccount.com`

### 環境変数（公開変数）

4. **NEXT_PUBLIC_SUPABASE_URL**
   - 値: SupabaseのプロジェクトURL

5. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - 値: Supabaseの匿名キー

6. **NEXT_PUBLIC_BASE_URL**
   - 値: デプロイ後のCloud Run URL（初回は仮の値でOK）

7. **NEXT_PUBLIC_SITE_URL**
   - 値: 同上

---

## Step 5: デプロイテスト

### 5.1 変更をコミット＆プッシュ

```bash
# GitHub Actionsワークフローをコミット
git add .github/workflows/deploy-cloud-run.yml docs/deployment-setup.md
git commit -m "feat: GitHub Actionsで自動デプロイを設定"
git push origin main
```

### 5.2 GitHub Actionsの実行を確認

GitHubリポジトリの **Actions** タブで、ワークフローの実行状況を確認します。

### 5.3 デプロイURLを確認

デプロイが成功したら、以下のコマンドでURLを取得します。

```bash
gcloud run services describe nextlevel-career-site \
    --region asia-northeast1 \
    --format="value(status.url)"
```

---

## トラブルシューティング

### エラー: Permission denied

**原因**: サービスアカウントに必要な権限がない

**解決**: Step 3.2の権限付与コマンドを再実行

### エラー: Workload Identity Provider not found

**原因**: Workload Identity Poolが正しく作成されていない

**解決**: Step 3.3のコマンドを再実行

### エラー: Secret not found

**原因**: Secret Managerにシークレットが登録されていない

**解決**: Step 2.1のコマンドを再実行

---

## 参考コマンド

### プロジェクト番号を取得

```bash
gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)'
```

### サービスアカウント一覧

```bash
gcloud iam service-accounts list
```

### Cloud Runサービス一覧

```bash
gcloud run services list --region asia-northeast1
```

### ログ確認

```bash
npm run logs
# または
gcloud run services logs read nextlevel-career-site --region asia-northeast1 --limit 50
```

---

## まとめ

これで、`main`ブランチへのプッシュ時に自動的にCloud Runへデプロイされるようになりました🎉

次回以降のデプロイは、単に`git push origin main`するだけでOKです！
