-- バナーカルーセル用テーブル
-- トップページに表示するピックアップバナーを管理する
CREATE TABLE banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 一般ユーザーは有効なバナーのみ閲覧可能
CREATE POLICY "Public can read active banners" ON banners
  FOR SELECT USING (is_active = true);

-- 管理者は全バナーを閲覧可能
CREATE POLICY "Admins can read all banners" ON banners
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can insert banners" ON banners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update banners" ON banners
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete banners" ON banners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 表示順でのクエリを高速化
CREATE INDEX idx_banners_active_order ON banners (display_order)
  WHERE is_active = true;
