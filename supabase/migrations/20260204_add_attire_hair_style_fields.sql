-- 服装・髪型を分離するための新規カラム追加
-- jobs テーブル
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attire_type text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hair_style text;

-- draft_jobs テーブル
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS attire_type text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS hair_style text;
