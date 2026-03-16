-- =============================================
-- get_public_jobs_list_rpc にソート機能追加
-- p_sort: 'newest'(新着順) | 'popular'(おすすめ順) | 'salary'(給与高い順)
-- =============================================

-- シグネチャ変更のため既存関数をDROP
DROP FUNCTION IF EXISTS get_public_jobs_list_rpc(text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION get_public_jobs_list_rpc(
  p_area text DEFAULT NULL,
  p_type text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0,
  p_sort text DEFAULT 'newest'
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
  LEFT JOIN (
    SELECT job_id, COUNT(*) AS view_count
    FROM job_views
    WHERE viewed_at >= now() - INTERVAL '30 days'
      AND is_bot = false
    GROUP BY job_id
  ) v ON v.job_id = j.id
  LEFT JOIN (
    SELECT job_id, COUNT(*) AS click_count
    FROM booking_clicks
    WHERE clicked_at >= now() - INTERVAL '30 days'
    GROUP BY job_id
  ) c ON c.job_id = j.id
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
  ORDER BY
    -- おすすめ順: 直近30日間の閲覧数×1 + 応募クリック数×5
    CASE WHEN p_sort = 'popular' THEN
      COALESCE(v.view_count, 0) + COALESCE(c.click_count, 0) * 5
    END DESC NULLS LAST,
    -- 給与が高い順: 正社員は年収上限(万円)、派遣は時給÷5(万円換算)
    CASE WHEN p_sort = 'salary' THEN
      COALESCE(fd.annual_salary_max::numeric, j.hourly_wage::numeric / 5)
    END DESC NULLS LAST,
    -- デフォルト: 新着順
    j.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 24), 60))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

GRANT EXECUTE ON FUNCTION get_public_jobs_list_rpc(text, text, text, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_jobs_list_rpc(text, text, text, integer, integer, text) TO service_role;
