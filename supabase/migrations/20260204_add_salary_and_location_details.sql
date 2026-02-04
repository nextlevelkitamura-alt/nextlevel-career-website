-- 求人詳細フィールド拡張: 給与詳細・勤務地詳細・職種詳細
-- jobs テーブル
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nearest_station text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_notes text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_type text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS raise_info text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS bonus_info text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS commute_allowance text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_category_detail text;

-- draft_jobs テーブル
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS nearest_station text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS location_notes text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS salary_type text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS raise_info text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS bonus_info text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS commute_allowance text;
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS job_category_detail text;
