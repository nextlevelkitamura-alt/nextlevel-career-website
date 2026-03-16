-- プロフィールフィールド追加（大手求人サイト水準への対応）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS self_pr text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS desired_job_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS desired_salary integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS transfer_timing text;
