-- エン転職対応: 正社員求人フィールド拡張
ALTER TABLE fulltime_job_details
  ADD COLUMN IF NOT EXISTS salary_example text,
  ADD COLUMN IF NOT EXISTS bonus text,
  ADD COLUMN IF NOT EXISTS raise text,
  ADD COLUMN IF NOT EXISTS annual_revenue text,
  ADD COLUMN IF NOT EXISTS onboarding_process text,
  ADD COLUMN IF NOT EXISTS interview_location text;

COMMENT ON COLUMN fulltime_job_details.salary_example IS '年収例（入社3年目/年収500万円 等）';
COMMENT ON COLUMN fulltime_job_details.bonus IS '賞与（年2回等）';
COMMENT ON COLUMN fulltime_job_details.raise IS '昇給（年1回等）';
COMMENT ON COLUMN fulltime_job_details.annual_revenue IS '売上高';
COMMENT ON COLUMN fulltime_job_details.onboarding_process IS '入社後の流れ';
COMMENT ON COLUMN fulltime_job_details.interview_location IS '面接地';
