-- バナーテーブルにフィールド追加: alt_text, link_target, starts_at, ends_at
ALTER TABLE banners ADD COLUMN IF NOT EXISTS alt_text text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_target text NOT NULL DEFAULT '_self';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS ends_at timestamptz;

-- RLSポリシー更新: 表示期間フィルタを追加
DROP POLICY IF EXISTS "Public can read active banners" ON banners;
CREATE POLICY "Public can read active banners" ON banners
  FOR SELECT USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );
