-- 取引先（clients）テーブルにデフォルト福利厚生カラムを追加
-- 掲載元選択時に自動で福利厚生を付与するためのマッピング
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS default_benefits jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN clients.default_benefits IS '掲載元として選択時に自動追加される福利厚生の配列';
