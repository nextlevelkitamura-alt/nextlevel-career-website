-- annual_holidays カラムを integer から text に変更
-- 「120日（配属先により変更あり）」等のテキスト入力に対応するため
ALTER TABLE fulltime_job_details
  ALTER COLUMN annual_holidays TYPE text
  USING annual_holidays::text;

COMMENT ON COLUMN fulltime_job_details.annual_holidays IS '年間休日（テキスト。例：120、120日（配属先により変更あり））';
