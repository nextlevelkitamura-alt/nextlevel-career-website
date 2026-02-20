-- dispatch_job_details テーブルに歓迎要件フィールドを追加
ALTER TABLE dispatch_job_details ADD COLUMN IF NOT EXISTS welcome_requirements text;
COMMENT ON COLUMN dispatch_job_details.welcome_requirements IS '歓迎要件';
