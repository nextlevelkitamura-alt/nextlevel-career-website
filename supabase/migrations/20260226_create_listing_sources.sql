-- 掲載元（媒体）マスタテーブル
-- 各掲載元に紐づくデフォルト福利厚生を管理する
CREATE TABLE listing_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  default_benefits jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listing_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read listing_sources" ON listing_sources
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert listing_sources" ON listing_sources
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update listing_sources" ON listing_sources
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete listing_sources" ON listing_sources
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 既存の jobs テーブルから使用済みの掲載元を自動シード
INSERT INTO listing_sources (name)
SELECT DISTINCT listing_source_name
FROM jobs
WHERE listing_source_name IS NOT NULL AND listing_source_name != ''
ON CONFLICT (name) DO NOTHING;
