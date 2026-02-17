-- 正社員求人の情報充実化（エン転職参考）
-- 教育制度、代表者、資本金、勤務地エリア詳細、給与エリア詳細、転勤方針を追加

ALTER TABLE fulltime_job_details
  ADD COLUMN IF NOT EXISTS education_training text,
  ADD COLUMN IF NOT EXISTS representative text,
  ADD COLUMN IF NOT EXISTS capital text,
  ADD COLUMN IF NOT EXISTS work_location_detail text,
  ADD COLUMN IF NOT EXISTS salary_detail text,
  ADD COLUMN IF NOT EXISTS transfer_policy text;
