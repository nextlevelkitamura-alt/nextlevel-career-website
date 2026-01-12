# 重要：Supabase設定手順

現在、Supabaseのデータベースに会員情報を保存するための「箱（テーブル）」がまだ作られていない状態です。
そのため、会員登録をしようとしても「保存先がない」というエラーになってしまいます。

以下の手順で、その「箱」を作成してください。これは1回だけ行えばOKです。

## 手順

1.  **SQLコードをコピーする**
    以下のコードをすべてコピーしてください。

    ```sql
    -- プロフィールテーブルの作成
    create table profiles (
      id uuid references auth.users on delete cascade not null primary key,
      updated_at timestamp with time zone,
      last_name text,
      first_name text,
      last_name_kana text,
      first_name_kana text,
      birth_date date,
      prefecture text,
      employment_period text,
    
      constraint last_name_length check (char_length(last_name) >= 1),
      constraint first_name_length check (char_length(first_name) >= 1)
    );
    
    -- セキュリティ設定（RLS）
    alter table profiles enable row level security;
    
    create policy "Public profiles are viewable by everyone." on profiles
      for select using (true);
    
    create policy "Users can insert their own profile." on profiles
      for insert with check (auth.uid() = id);
    
    create policy "Users can update own profile." on profiles
      for update using (auth.uid() = id);
    ```

2.  **Supabaseの管理画面を開く**
    こちらのリンクをクリックして、SQLエディタを開きます：
    [Supabase SQL Editor](https://supabase.com/dashboard/project/oqrvutvyyscvacmxvpkk/sql/new)

3.  **コードを貼り付けて実行する**
    *   開いた画面の入力欄に、さきほどコピーしたコードを貼り付けます。
    *   画面右下（または右上）にある **「Run」** ボタンをクリックします。
    *   "Success" と表示されれば完了です。

## エラーについて

**「For security purposes...」というエラー**
何度も登録を試みたため、一時的にロックがかかっています。1分ほど待ってから再度お試しください。

**「User already registered」というエラー**
すでにメールアドレス自体は登録されている可能性があります（プロフィール作成だけ失敗している状態）。
その場合は、別のメールアドレスで試すか、Supabaseの「Authentication」>「Users」から該当ユーザーを削除してから再度お試しください。
