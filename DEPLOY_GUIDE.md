# デプロイメントガイド (Deployment Guide)

このWebアプリケーションをインターネット上で公開（デプロイ）し、今後も修正・更新していくための手順を説明します。
**推奨プラットフォーム: Vercel** (Next.jsの開発元が提供しており、相性が最高です)

---

## 予期される質問への回答
> 「今後修正する可能性はありますがそれでもデプロイしていいですか？」

**はい、全く問題ありません！**
Vercelは GitHub と連携することで、コードを修正して GitHub に「プッシュ（保存）」するたびに、**自動的に新しいバージョンをデプロイしてくれます**。
したがって、まずは現在の状態で公開し、その後機能追加や修正を行うのが一般的な開発フローです。

---

## 手順 1: GitHub リポジトリの作成とプッシュ

現在のコードはお客様のパソコン内にしかありません。まずはこれを GitHub（クラウド上のコード保存場所）にアップロードします。

1.  **[GitHub](https://github.com/new)** にアクセスし、新しいリポジトリを作成します。
    *   **Repository name**: `nextlevel-career-site` (例)
    *   **Public/Private**: Private（非公開）を推奨します（個人情報や社内情報が含まれる可能性があるため）。
    *   **Create repository** をクリック。

2.  作成後の画面に表示されるコマンドを使って、ローカルのコードをアップロードします。
    ターミナルで以下のコマンドを順番に実行してください（`[YOUR_GITHUB_USER]`などはご自身のものに置き換えてください）。

    ```bash
    git branch -M main
    git remote add origin https://github.com/[YOUR_GITHUB_USER]/nextlevel-career-site.git
    git push -u origin main
    ```

---

## 手順 2: Vercel へのデプロイ

1.  **[Vercel](https://vercel.com/new)** にアクセスし、GitHubアカウントでログインします。
2.  **Import Git Repository** の画面で、先ほど作成した `nextlevel-career-site` の横にある **Import** ボタンを押します。
3.  **Configure Project** 画面が表示されます。ここで設定が必要です。

### ⚠️ 重要: 環境変数の設定 (Environment Variables)
`.env.local` ファイルに書かれている秘密鍵などは、セキュリティの観点から GitHub にはアップロードされません。Vercel上で手動設定する必要があります。

**Environment Variables** のセクションを展開し、以下の値をコピー＆ペーストで追加してください。
（`.env.local` ファイルの中身を確認して入力します）

| Key (名前) | Valid (値) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` の値 (https://...supabase.co) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` の値 (eyJ...) |
| `RESEND_API_KEY` | 取得したAPIキー (re_...) |
| `NEXT_PUBLIC_SITE_URL` | Vercelで発行されるURL (例: `https://nextlevel-career.vercel.app`) ※デプロイ後に設定でもOK |

4.  設定が終わったら **Deploy** ボタンを押します。

---

## 手順 3: 動作確認と今後の更新

### 動作確認
デプロイが完了すると、`https://nextlevel-career-site.vercel.app` のようなURLが発行されます。アクセスして、ログインやプロフィールの更新ができるか確認してください。

### 今後の更新方法
コードを修正したときは、以下のコマンドを実行するだけで、Vercelが自動的に最新版にしてくれます。

```bash
git add .
git commit -m "修正内容のメモ"
git push
```
これだけでデプロイは完了です！
