-- ==========================================
-- Phase 0: DB項目の拡張（テーブル分離）
-- 派遣と正社員で異なるデータ構造に対応
-- ==========================================

-- 1. jobs テーブルに employment_type カラムを追加
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employment_type text CHECK (employment_type IN ('dispatch', 'fulltime'));

COMMENT ON COLUMN jobs.employment_type IS '雇用形態: dispatch (派遣) or fulltime (正社員)';

-- 2. 派遣専用テーブル (dispatch_job_details)
CREATE TABLE IF NOT EXISTS dispatch_job_details (
  id uuid PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,

  -- 企業情報（派遣先）
  client_company_name text,
  is_client_company_public boolean DEFAULT true,

  -- 給与・研修
  training_salary text,
  training_period text,

  -- 勤務条件
  end_date text,
  actual_work_hours text,
  work_days_per_week text,

  -- 服装規定（派遣で重要）
  nail_policy text,

  -- その他
  shift_notes text,
  general_notes text,

  -- タイムスタンプ
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE dispatch_job_details IS '派遣求人の詳細情報';
COMMENT ON COLUMN dispatch_job_details.client_company_name IS '就業先企業名';
COMMENT ON COLUMN dispatch_job_details.is_client_company_public IS '企業名公開フラグ（非公開時は「大手メーカー」等で表示）';
COMMENT ON COLUMN dispatch_job_details.training_salary IS '研修期間中の時給';
COMMENT ON COLUMN dispatch_job_details.training_period IS '研修期間・内容';
COMMENT ON COLUMN dispatch_job_details.end_date IS '契約終了日（長期 or YYYY-MM-DD）';
COMMENT ON COLUMN dispatch_job_details.actual_work_hours IS '1日の実働時間';
COMMENT ON COLUMN dispatch_job_details.work_days_per_week IS '週の出勤日数';
COMMENT ON COLUMN dispatch_job_details.nail_policy IS 'ネイル規定';
COMMENT ON COLUMN dispatch_job_details.shift_notes IS 'シフトに関する備考';
COMMENT ON COLUMN dispatch_job_details.general_notes IS '一般備考';

-- 3. 正社員専用テーブル (fulltime_job_details)
CREATE TABLE IF NOT EXISTS fulltime_job_details (
  id uuid PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,

  -- 企業情報（正社員で重要）
  company_name text,
  is_company_name_public boolean DEFAULT true,
  company_address text,
  industry text,
  company_size text,
  established_date text,
  company_overview text,
  business_overview text,

  -- 年収
  annual_salary_min integer,
  annual_salary_max integer,

  -- 勤務条件
  overtime_hours text,
  annual_holidays integer,
  probation_period text,
  probation_details text,
  part_time_available boolean DEFAULT false,
  smoking_policy text,

  -- 訴求ポイント（正社員で重要）
  appeal_points text,
  welcome_requirements text,
  department_details text,

  -- タイムスタンプ
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE fulltime_job_details IS '正社員求人の詳細情報';
COMMENT ON COLUMN fulltime_job_details.company_name IS '会社名';
COMMENT ON COLUMN fulltime_job_details.is_company_name_public IS '企業名公開フラグ（非公開時は「IT企業」等で表示）';
COMMENT ON COLUMN fulltime_job_details.company_address IS '本社住所';
COMMENT ON COLUMN fulltime_job_details.industry IS '業界';
COMMENT ON COLUMN fulltime_job_details.company_size IS '従業員数';
COMMENT ON COLUMN fulltime_job_details.established_date IS '設立年月';
COMMENT ON COLUMN fulltime_job_details.company_overview IS '会社概要';
COMMENT ON COLUMN fulltime_job_details.business_overview IS '事業概要';
COMMENT ON COLUMN fulltime_job_details.annual_salary_min IS '最低年収（万円）';
COMMENT ON COLUMN fulltime_job_details.annual_salary_max IS '最高年収（万円）';
COMMENT ON COLUMN fulltime_job_details.overtime_hours IS '残業時間';
COMMENT ON COLUMN fulltime_job_details.annual_holidays IS '年間休日数';
COMMENT ON COLUMN fulltime_job_details.probation_period IS '試用期間';
COMMENT ON COLUMN fulltime_job_details.probation_details IS '試用期間の詳細';
COMMENT ON COLUMN fulltime_job_details.part_time_available IS '時短勤務可否';
COMMENT ON COLUMN fulltime_job_details.smoking_policy IS '受動喫煙対策';
COMMENT ON COLUMN fulltime_job_details.appeal_points IS '仕事の醍醐味・やりがい';
COMMENT ON COLUMN fulltime_job_details.welcome_requirements IS '歓迎要件';
COMMENT ON COLUMN fulltime_job_details.department_details IS '部署詳細（転勤の有無等）';

-- 4. RLS (Row Level Security) ポリシーの設定

-- dispatch_job_details
ALTER TABLE dispatch_job_details ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能（jobsテーブルと同様に全公開）
CREATE POLICY "Public can view dispatch job details" ON dispatch_job_details
  FOR SELECT USING (true);

-- 管理者のみ挿入・更新・削除可能
CREATE POLICY "Admins can insert dispatch job details" ON dispatch_job_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update dispatch job details" ON dispatch_job_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete dispatch job details" ON dispatch_job_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- fulltime_job_details
ALTER TABLE fulltime_job_details ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能（jobsテーブルと同様に全公開）
CREATE POLICY "Public can view fulltime job details" ON fulltime_job_details
  FOR SELECT USING (true);

-- 管理者のみ挿入・更新・削除可能
CREATE POLICY "Admins can insert fulltime job details" ON fulltime_job_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update fulltime job details" ON fulltime_job_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete fulltime job details" ON fulltime_job_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 5. draft_jobs テーブルへの追加は省略（本番DBに存在しないため）
-- ※ draft_jobs が作成された後に別途追加する

-- 完了
NOTIFY pgrst, 'reload config';
