-- 正社員求人に募集背景と企業HPを追加
ALTER TABLE fulltime_job_details
  ADD COLUMN IF NOT EXISTS recruitment_background text,
  ADD COLUMN IF NOT EXISTS company_url text;

COMMENT ON COLUMN fulltime_job_details.recruitment_background IS '募集背景';
COMMENT ON COLUMN fulltime_job_details.company_url IS '企業ホームページURL';
