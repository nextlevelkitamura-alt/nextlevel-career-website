-- =============================================
-- nearest_station を検索条件に追加
-- エリア検索で駅名でもヒットするようにする
-- =============================================

-- 既存関数をDROP（引数型が同じなのでCREATE OR REPLACEで上書き可能だが、安全のため）
DROP FUNCTION IF EXISTS get_public_jobs_list_rpc(text,text,text,integer,integer);
DROP FUNCTION IF EXISTS search_jobs_by_area_rpc(text,text,uuid,integer);

-- get_public_jobs_list_rpc: nearest_station 検索条件追加
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
      OR j.nearest_station ILIKE ('%' || p_area || '%')
    )
  ORDER BY j.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 24), 60))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

-- search_jobs_by_area_rpc: nearest_station 検索条件追加
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
      OR j.nearest_station ILIKE ('%' || p_area || '%')
    )
  ORDER BY j.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 60));
$$;
