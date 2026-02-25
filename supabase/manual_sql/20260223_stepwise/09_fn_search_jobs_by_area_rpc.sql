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
  category text,
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
    AND (p_type IS NULL OR p_type = '' OR j.type = p_type)
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
