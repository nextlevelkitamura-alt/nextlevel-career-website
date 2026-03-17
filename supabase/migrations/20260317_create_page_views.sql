-- ページ閲覧ログテーブル（トップページ等のサイト全体のアクセス集計用）
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  is_bot BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- インデックス
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX idx_page_views_path_viewed_at ON page_views(page_path, viewed_at);
CREATE INDEX idx_page_views_not_bot ON page_views(is_bot) WHERE is_bot = false;

-- RLS有効化
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 誰でもINSERT可能（閲覧記録は匿名でも残す）
CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT
  WITH CHECK (true);

-- 管理者のみSELECT可能
CREATE POLICY "Admins can view all page views" ON page_views
  FOR SELECT
  USING (is_admin());
