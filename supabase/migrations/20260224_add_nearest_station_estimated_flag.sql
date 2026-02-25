ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS nearest_station_is_estimated boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN jobs.nearest_station_is_estimated IS '最寄駅が推定値（明示記載なし）かどうか';

UPDATE jobs j
SET nearest_station_is_estimated = true
WHERE
  COALESCE(j.nearest_station, '') <> ''
  AND COALESCE(j.nearest_station_is_estimated, false) = false
  AND COALESCE(j.workplace_access, '') NOT ILIKE ('%' || j.nearest_station || '%')
  AND COALESCE(j.location_notes, '') NOT ILIKE ('%' || j.nearest_station || '%')
  AND NOT EXISTS (
    SELECT 1
    FROM fulltime_job_details fd
    WHERE fd.id = j.id
      AND COALESCE(fd.work_location_detail, '') ILIKE ('%' || j.nearest_station || '%')
  );

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
  category text,
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
    AND (p_type IS NULL OR p_type = '' OR j.type = p_type)
    AND (p_category IS NULL OR p_category = '' OR j.category = p_category)
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
