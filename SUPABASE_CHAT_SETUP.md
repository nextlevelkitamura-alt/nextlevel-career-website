# チャット機能データベース設定 (Supabase)

チャット機能を有効にするために、SupabaseのSQLエディタで以下のSQLを実行してください。

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

-- 2. RLSポリシーの設定（セキュリティ）
alter table public.chat_messages enable row level security;

-- ユーザーは自分のチャットのみ閲覧可能
create policy "Users can view their own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

-- ユーザーは自分宛のメッセージを送信可能
create policy "Users can insert their own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- 管理者は全てのメッセージを閲覧・操作可能（is_adminカラムに基づくポリシー設定が必要ですが、
-- 今回はサーバーサイド（Server Actions）で管理者権限をチェックするため、
-- データベースレベルではシンプルなポリシーにしておきます。
-- 厳密な商用環境では、profiles.is_admin = true のユーザーのみ許可するポリシーを追加してください）

-- 3. 画像保存用バケットの作成
insert into storage.buckets (id, name, public) 
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

-- 4. ストレージポリシーの設定
-- 誰でも画像を閲覧可能（公開URLを使用するため）
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'chat-images' );

-- 認証済みユーザーは画像をアップロード可能
create policy "Authenticated users can upload chat images"
  on storage.objects for insert
  with check ( bucket_id = 'chat-images' and auth.role() = 'authenticated' );
```
