# デプロイ手順

## 概要

このプロジェクトは **GitHub Actions** を使用して **Google Cloud Run** に自動デプロイされます。

ブランチ: `main`
トリガー: `main` ブランチへの push

---

## 自動デプロイの流れ

```
コード変更 → main ブランチに push → GitHub Actions 自動発火 → ビルド & デプロイ完了
```

---

## デプロイ手順

### 方法 1: 通常のコミット & プッシュ（推奨）

```bash
# 1. 変更をステージング
git add .
# または特定のファイル
git add app/admin/actions.ts

# 2. コミット
git commit -m "feat: 機能追加"

# 3. プッシュ（これで自動デプロイが開始）
git push origin main
```

### 方法 2: コマンド一発でプッシュまで

```bash
git add . && git commit -m "feat: 機能追加" && git push origin main
```

### 方法 3: 変更を取り消す場合

```bash
# 直前のコミットを取り消してプッシュ
git reset --soft HEAD~1
git push origin main +f
```

---

## デプロイ状況の確認

### GitHub Actions の実行状況を確認

```bash
# 最新の実行状況
gh run list --branch main --limit 5

# 特定の実行の詳細を確認
gh run view <run-id>

# 実行中の最新ジョブを監視（終了まで待機）
gh run watch
```

### GitHub Web で確認

1. リポジトリの **Actions** タブを開く
2. `deploy-cloud-run` ワークフローの実行状況を確認
3. 完了まで約 3〜5 分かかります

---

## 本番 URL

**現在の本番環境:** https://nextlevel-career-site-rxoneg3z6a-an.a.run.app

デプロイが完了すると自動的に新しいバージョンが反映されます。

---

## トラブルシューティング

### デプロイが失敗した場合

1. **GitHub Actions のログを確認**
   - Actions タブ → 失敗した実行 → ジぼしいログを確認

2. **主な失敗原因**
   - 環境変数が未設定
   - ビルドエラー（TypeScript エラー等）
   - テストが失敗している

3. **環境変数の設定場所**
   - GitHub: `Settings` → `Secrets and variables` → `Actions`
   - 必要な環境変数:
     - `GEMINI_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_BASE_URL`
     - `NEXT_PUBLIC_SITE_URL`
     - `RESEND_API_KEY`

### 手動デプロイ（GitHub Actions が動かない場合）

```bash
npm run deploy
```

このコマンドでローカルから直接 Cloud Run にデプロイできます。

---

## ブランチ運用ポリシー

| ブランチ | 用途 |
|---|---|
| `main` | 本番環境（自動デプロイ対象） |
| `feature/*` | 機能開発用ブランチ |
| `hotfix/*` | 緊急修正用ブランチ |

開発時は `feature/*` ブランチで作業し、完了後に `main` にマージしてください。
