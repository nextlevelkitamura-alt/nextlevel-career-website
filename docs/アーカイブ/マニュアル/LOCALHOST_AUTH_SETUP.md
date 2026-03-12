# LocalhostでのGoogle認証設定手順 (Port 3003)

ローカル環境 (`http://localhost:3003`) でGoogleログインを行えるようにするためには、SupabaseとGoogle Cloud Consoleの両方で設定を追加する必要があります。

## 1. Supabase側の設定

1.  [Supabase Dashboard](https://supabase.com/dashboard/projects) にアクセスし、対象のプロジェクトを開きます。
2.  左メニューの **Authentication** -> **URL Configuration** をクリックします。
3.  **Redirect URLs** セクションにある **Add URL** ボタンをクリックします。
4.  以下のURLを追加し、**Save** します。
    *   `http://localhost:3003/**`
    *   `http://localhost:3003/auth/callback` (念のため)

## 2. Google Cloud Console側の設定

1.  [Google Cloud Console](https://console.cloud.google.com/apis/credentials) にアクセスします。
2.  対象のプロジェクトを選択し、**認証情報 (Credentials)** ページを開きます。
3.  作成済みの **OAuth 2.0 クライアント ID** の名前をクリックして編集画面を開きます。
4.  **承認済みのリダイレクト URI (Authorized redirect URIs)** のリストに、以下のURLを追加します。
    *   （既存のSupabaseのCallback URLはそのまま残してください）
    *   **重要**: ここに追加するのは `http://localhost:3003` ではなく、**SupabaseのCallback URL** です。
    *   ※ Supabase経由で認証する場合、Google側の設定変更は**不要**なケースがほとんどです。Googleはあくまで「SupabaseのURL」に返せばよく、最終的にSupabaseが「Localhost」にリダイレクトしてくれるからです。
    *   もし手順1（Supabase側の設定）だけで動かない場合のみ、Google側にも `http://localhost:3003` を追加してください（通常は不要です）。

## 3. 動作確認

1.  ローカルサーバーをポート3003で起動します:
    ```bash
    npm run dev -- -p 3003
    ```
    (または `package.json` の `dev` スクリプトを `"next dev -p 3003"` に書き換えると便利です)

2.  ブラウザで `http://localhost:3003/login` にアクセスします。
3.  「Googleでログイン」ボタンを押し、ログイン後に `localhost:3003` のマイページに戻ってこれれば成功です。
