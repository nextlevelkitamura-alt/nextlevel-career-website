-- 求人閲覧ログテーブル
CREATE TABLE IF NOT EXISTS job_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  is_bot BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- インデックス
CREATE INDEX idx_job_views_job_id ON job_views(job_id);
CREATE INDEX idx_job_views_viewed_at ON job_views(viewed_at);
CREATE INDEX idx_job_views_job_id_viewed_at ON job_views(job_id, viewed_at);
CREATE INDEX idx_job_views_not_bot ON job_views(is_bot) WHERE is_bot = false;

-- RLS有効化
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- 誰でもINSERT可能（閲覧記録は匿名でも残す）
CREATE POLICY "Anyone can insert job views" ON job_views
  FOR INSERT
  WITH CHECK (true);

-- 管理者のみSELECT可能
CREATE POLICY "Admins can view all job views" ON job_views
  FOR SELECT
  USING (is_admin());
