-- =============================================
-- カテゴリーを単一値(text)から複数値(text[])に変換
-- =============================================

-- 1. jobs テーブル: text → text[]
ALTER TABLE jobs ALTER COLUMN category TYPE text[]
  USING CASE
    WHEN category IS NULL THEN NULL
    WHEN category = '' THEN ARRAY[]::text[]
    ELSE ARRAY[category]
  END;

-- 2. GINインデックス追加（配列検索高速化）
CREATE INDEX IF NOT EXISTS jobs_category_gin_idx ON jobs USING GIN (category);

-- =============================================
-- 既存関数をDROP（引数型・戻り値型が変わるため）
-- =============================================
DROP FUNCTION IF EXISTS get_public_jobs_list_rpc(text,text,text,integer,integer);
DROP FUNCTION IF EXISTS search_jobs_by_area_rpc(text,text,uuid,integer);
DROP FUNCTION IF EXISTS job_matches_search_category(text,text,text,text,text);

-- =============================================
-- SQL関数の再作成
-- =============================================

-- job_matches_search_category: p_job_category を text[] に変更
CREATE OR REPLACE FUNCTION job_matches_search_category(
  p_category text,
  p_job_categories text[],
  p_job_category_detail text,
  p_job_title text,
  p_job_description text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  WITH normalized AS (
    SELECT normalize_job_search_category(p_category) AS c
  ),
  source AS (
    SELECT lower(
      COALESCE(array_to_string(p_job_categories, ' '), '') || ' ' ||
      COALESCE(p_job_category_detail, '') || ' ' ||
      COALESCE(p_job_title, '') || ' ' ||
      COALESCE(p_job_description, '')
    ) AS text
  ),
  keywords AS (
    SELECT CASE (SELECT c FROM normalized)
      WHEN '事務' THEN ARRAY['事務','営業事務','一般事務','経理','総務','人事','労務','データ入力','秘書','受付']::text[]
      WHEN '営業' THEN ARRAY['営業','法人営業','個人営業','ルート営業','セールス','インサイドセールス','フィールドセールス']::text[]
      WHEN 'コールセンター' THEN ARRAY['コールセンター','テレオペ','受電','発信','問い合わせ対応','コンタクトセンター','カスタマーサポート']::text[]
      WHEN 'IT・エンジニア' THEN ARRAY['it','エンジニア','se','社内se','開発','プログラマ','プログラマー','インフラ','ネットワーク','ヘルプデスク']::text[]
      WHEN 'クリエイティブ' THEN ARRAY['クリエイティブ','デザイナー','webデザイナー','ui','ux','動画編集','ライター','ディレクター']::text[]
      WHEN '販売・接客' THEN ARRAY['販売','接客','店舗','ショップ','アパレル','レジ','ホール','サービススタッフ','カウンセラー']::text[]
      WHEN '製造・軽作業' THEN ARRAY['製造','軽作業','工場','ライン','倉庫','検品','梱包','仕分け','ピッキング','物流']::text[]
      WHEN '医療・介護' THEN ARRAY['医療','介護','看護','看護師','准看護師','病院','クリニック','ケア','ヘルパー','医療事務','歯科']::text[]
      WHEN 'リモート' THEN ARRAY['リモート','在宅','テレワーク','フルリモート']::text[]
      ELSE ARRAY[]::text[]
    END AS list
  )
  SELECT
    (SELECT c FROM normalized) = ''
    OR (SELECT c FROM normalized) = ANY(
      SELECT lower(unnest) FROM unnest(COALESCE(p_job_categories, ARRAY[]::text[]))
    )
    OR EXISTS (
      SELECT 1
      FROM unnest((SELECT list FROM keywords)) AS keyword
      WHERE (SELECT text FROM source) LIKE ('%' || lower(keyword) || '%')
    );
$$;

-- get_public_jobs_list_rpc: category を text[] に変更
CREATE OR REPLACE FUNCTION get_public_jobs_list_rpc(
  p_area text DEFAULT NULL,
  p_type text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  area text,
  search_areas text[],
  salary text,
  type text,
  category text[],
  tags text[],
  hourly_wage integer,
  job_code text,
  nearest_station text,
  nearest_station_is_estimated boolean,
  workplace_address text,
  working_hours text,
  holidays text,
  job_category_detail text,
  created_at timestamptz,
  expires_at timestamptz,
  annual_salary_min integer,
  annual_salary_max integer,
  annual_holidays text,
  company_name text,
  total_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    j.id,
    j.title,
    j.area,
    j.search_areas,
    j.salary,
    j.type,
    j.category,
    j.tags,
    j.hourly_wage,
    j.job_code,
    j.nearest_station,
    j.nearest_station_is_estimated,
    j.workplace_address,
    j.working_hours,
    j.holidays,
    j.job_category_detail,
    j.created_at,
    j.expires_at,
    fd.annual_salary_min,
    fd.annual_salary_max,
    fd.annual_holidays,
    fd.company_name,
    COUNT(*) OVER() AS total_count
  FROM jobs j
  LEFT JOIN fulltime_job_details fd ON fd.id = j.id
  WHERE
    (j.expires_at IS NULL OR j.expires_at > now())
    AND (
      p_type IS NULL OR p_type = ''
      OR (p_type = '派遣' AND j.type IN ('派遣', '紹介予定派遣'))
      OR (p_type <> '派遣' AND j.type = p_type)
    )
    AND job_matches_search_category(
      p_category,
      j.category,
      j.job_category_detail,
      j.title,
      j.description
    )
    AND (
      p_area IS NULL OR p_area = ''
      OR j.area ILIKE ('%' || p_area || '%')
      OR EXISTS (
        SELECT 1
        FROM unnest(COALESCE(j.search_areas, ARRAY[]::text[])) AS sa
        WHERE sa ILIKE ('%' || p_area || '%')
      )
    )
  ORDER BY j.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 24), 60))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

-- search_jobs_by_area_rpc: category を text[] に変更
CREATE OR REPLACE FUNCTION search_jobs_by_area_rpc(
  p_area text DEFAULT NULL,
  p_type text DEFAULT NULL,
  p_current_job_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  area text,
  salary text,
  type text,
  category text[],
  hourly_wage integer,
  annual_salary_min integer,
  annual_salary_max integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    j.id,
    j.title,
    j.area,
    j.salary,
    j.type,
    j.category,
    j.hourly_wage,
    fd.annual_salary_min,
    fd.annual_salary_max
  FROM jobs j
  LEFT JOIN fulltime_job_details fd ON fd.id = j.id
  WHERE
    (j.expires_at IS NULL OR j.expires_at > now())
    AND (
      p_type IS NULL OR p_type = ''
      OR (p_type = '派遣' AND j.type IN ('派遣', '紹介予定派遣'))
      OR (p_type <> '派遣' AND j.type = p_type)
    )
    AND (p_current_job_id IS NULL OR j.id <> p_current_job_id)
    AND (
      p_area IS NULL OR p_area = ''
      OR j.area ILIKE ('%' || p_area || '%')
      OR EXISTS (
        SELECT 1
        FROM unnest(COALESCE(j.search_areas, ARRAY[]::text[])) AS sa
        WHERE sa ILIKE ('%' || p_area || '%')
      )
    )
  ORDER BY j.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 60));
$$;
