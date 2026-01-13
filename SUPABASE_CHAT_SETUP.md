# チャット機能データベース設定 (Supabase)

チャット機能を有効にするために、SupabaseのSQLエディタで以下のSQLを実行してください。

## 初期セットアップ（既に実行済みの場合はスキップ）

```sql
-- 1. チャットメッセージテーブルの作成
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null, -- チャットのオーナー（一般ユーザー）
  sender_id uuid references public.profiles(id) not null, -- 送信者（一般ユーザーまたは管理者）
  content text,
  image_url text,
  is_admin_message boolean default false,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLSを有効化
alter table public.chat_messages enable row level security;

-- 3. 画像保存用バケットの作成
insert into storage.buckets (id, name, public) 
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;
```

## RLSポリシー設定（管理者対応版）

> [!IMPORTANT]
> 以下のSQLを実行してください。既存のポリシーがある場合は先に削除されます。

```sql
-- === 既存ポリシーの削除（エラーを無視して続行してください） ===
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.chat_messages;

-- === 一般ユーザー向けポリシー ===

-- ユーザーは自分のチャットのみ閲覧可能
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分宛のメッセージを送信可能
CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- === 管理者向けポリシー ===

-- 管理者は全てのメッセージを閲覧可能
CREATE POLICY "Admins can view all messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理者は誰宛でもメッセージを送信可能
CREATE POLICY "Admins can insert messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理者はメッセージを削除可能
CREATE POLICY "Admins can delete messages"
  ON public.chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- === ストレージポリシー ===

-- 誰でも画像を閲覧可能（公開URLを使用するため）
CREATE POLICY IF NOT EXISTS "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-images' );

-- 認証済みユーザーは画像をアップロード可能
CREATE POLICY IF NOT EXISTS "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-images' AND auth.role() = 'authenticated' );
```

## 実行後の確認

SQLを実行後、管理者アカウントでログインし直すと、メッセージ管理画面で全ユーザーのチャットが表示されるようになります。
