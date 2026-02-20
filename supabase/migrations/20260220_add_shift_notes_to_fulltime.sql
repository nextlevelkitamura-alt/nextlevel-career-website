-- 正社員テーブルに勤務時間の補足情報カラムを追加
ALTER TABLE fulltime_job_details
  ADD COLUMN IF NOT EXISTS shift_notes text;

COMMENT ON COLUMN fulltime_job_details.shift_notes IS '勤務時間の補足情報（所定労働時間、休憩詳細、フレックス詳細等）';
