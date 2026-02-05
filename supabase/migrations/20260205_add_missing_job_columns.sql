-- 求人詳細フィールドの追加
-- 服装・髪型、給与詳細、勤務先情報、雇用条件などの追加

-- jobs テーブル
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attire_type text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hair_style text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS commute_allowance text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_category_detail text;
