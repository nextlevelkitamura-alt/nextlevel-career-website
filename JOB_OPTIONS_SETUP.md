# job_options テーブルセットアップ

`求人マスタ管理` 画面でタグを管理するためのテーブルとRLSポリシーです。

## 1. テーブル作成

Supabase SQL Editor で以下を実行してください:

```sql
-- job_options テーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS job_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_job_options_category ON job_options(category);
```

## 2. RLS (Row Level Security) ポリシー設定

```sql
-- RLSを有効化
ALTER TABLE job_options ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能 (求人フォームでオプションを表示するため)
DROP POLICY IF EXISTS "job_options_read_all" ON job_options;
CREATE POLICY "job_options_read_all" ON job_options
    FOR SELECT USING (true);

-- 管理者のみ追加可能
DROP POLICY IF EXISTS "job_options_insert_admin" ON job_options;
CREATE POLICY "job_options_insert_admin" ON job_options
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- 管理者のみ削除可能
DROP POLICY IF EXISTS "job_options_delete_admin" ON job_options;
CREATE POLICY "job_options_delete_admin" ON job_options
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
```

## 3. 動作確認

セットアップ完了後、`/admin/jobs/masters` ページを再読み込みしてください。
