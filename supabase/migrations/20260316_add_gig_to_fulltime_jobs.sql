-- ==========================================
-- スキマバイトから正社員 雇用形態の追加
-- ==========================================

-- 1. jobs.employment_type の許容値に gig_to_fulltime を追加
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_employment_type_check
  CHECK (employment_type IN ('dispatch', 'fulltime', 'gig_to_fulltime'));

-- 2. スキマバイトから正社員専用テーブル
CREATE TABLE IF NOT EXISTS gig_to_fulltime_job_details (
  id uuid PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,

  -- スキマバイト期間
  trial_period text,          -- 例: "1〜2週間"
  gig_job_url text,           -- スキマバイト求人へのリンク（応募ボタン遷移先）

  -- 転換後の正社員条件
  annual_salary_min integer,  -- 転換後の年収（下限・万円）
  annual_salary_max integer,  -- 転換後の年収（上限・万円）
  annual_holidays text,       -- 年間休日
  probation_period text,      -- 転換後の試用期間
  probation_details text,     -- 試用期間の詳細
  overtime_hours text,        -- 残業時間
  smoking_policy text,        -- 受動喫煙対策

  -- 訴求ポイント
  appeal_points text,         -- 仕事の魅力・やりがい
  welcome_requirements text,  -- 歓迎要件

  -- タイムスタンプ
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE gig_to_fulltime_job_details IS 'スキマバイトから正社員 求人の詳細情報';
COMMENT ON COLUMN gig_to_fulltime_job_details.trial_period IS 'スキマバイト試用期間（例: 1〜2週間）';
COMMENT ON COLUMN gig_to_fulltime_job_details.gig_job_url IS 'スキマバイト求人へのリンク（応募ボタン遷移先）';
COMMENT ON COLUMN gig_to_fulltime_job_details.annual_salary_min IS '転換後の年収下限（万円）';
COMMENT ON COLUMN gig_to_fulltime_job_details.annual_salary_max IS '転換後の年収上限（万円）';

-- 3. applications.status に 'converted' を追加
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'reviewed', 'interview', 'rejected', 'hired', 'converted'));

-- 4. RLS ポリシーの設定
ALTER TABLE gig_to_fulltime_job_details ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY "Public can view gig to fulltime job details" ON gig_to_fulltime_job_details
  FOR SELECT USING (true);

-- 管理者のみ挿入・更新・削除可能
CREATE POLICY "Admins can insert gig to fulltime job details" ON gig_to_fulltime_job_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update gig to fulltime job details" ON gig_to_fulltime_job_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete gig to fulltime job details" ON gig_to_fulltime_job_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 完了
NOTIFY pgrst, 'reload config';
