-- 1. 求人テーブル（jobs）の作成
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  area text not null,
  type text not null,
  salary text not null,
  category text not null,
  tags text[]
);

-- 2. セキュリティ設定（RLS）の有効化
alter table jobs enable row level security;

-- 3. 誰でも求人を見れるようにする
create policy "Public jobs are viewable by everyone." on jobs
  for select using (true);

-- 4. プロフィールテーブルに管理者フラグを追加
alter table profiles add column is_admin boolean default false;

-- 5. 管理者だけが求人を操作（追加・編集・削除）できるようにする
create policy "Admins can insert jobs." on jobs
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update jobs." on jobs
  for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete jobs." on jobs
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
