-- 給与内訳フィールドを追加
ALTER TABLE fulltime_job_details
  ADD COLUMN IF NOT EXISTS salary_breakdown text;
