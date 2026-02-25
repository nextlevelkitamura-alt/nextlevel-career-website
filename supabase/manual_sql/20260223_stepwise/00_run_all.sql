-- Optimize read-heavy job listing/search queries
CREATE INDEX IF NOT EXISTS idx_jobs_expires_created_at
  ON jobs (expires_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_type
  ON jobs (type);

CREATE INDEX IF NOT EXISTS idx_jobs_category
  ON jobs (category);

CREATE INDEX IF NOT EXISTS idx_jobs_search_areas_gin
  ON jobs USING GIN (search_areas);

CREATE INDEX IF NOT EXISTS idx_jobs_tags_gin
  ON jobs USING GIN (tags);
-- Add uniqueness guard for job_code when existing data is clean.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_jobs_job_code_unique'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT job_code
    FROM jobs
    WHERE job_code IS NOT NULL
    GROUP BY job_code
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Skip unique index on jobs.job_code because duplicated values exist.';
    RETURN;
  END IF;

  EXECUTE 'CREATE UNIQUE INDEX idx_jobs_job_code_unique ON jobs (job_code) WHERE job_code IS NOT NULL';
END $$;
CREATE OR REPLACE FUNCTION generate_unique_job_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_candidate text;
  v_exists boolean;
  i integer := 0;
BEGIN
  LOOP
    i := i + 1;
    IF i > 50 THEN
      RAISE EXCEPTION 'Failed to generate unique job code after % attempts', i - 1;
    END IF;

    v_candidate := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');

    SELECT EXISTS(
      SELECT 1 FROM jobs WHERE job_code = v_candidate
    ) INTO v_exists;

    IF NOT v_exists THEN
      RETURN v_candidate;
    END IF;
  END LOOP;
END;
$$;
CREATE OR REPLACE FUNCTION create_job_with_details(
  p_job jsonb,
  p_dispatch jsonb DEFAULT NULL,
  p_fulltime jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id uuid;
  v_type text;
BEGIN
  INSERT INTO jobs (
    title,
    job_code,
    area,
    search_areas,
    type,
    salary,
    category,
    tags,
    client_id,
    description,
    requirements,
    working_hours,
    holidays,
    benefits,
    selection_process,
    hourly_wage,
    salary_description,
    period,
    start_date,
    workplace_name,
    workplace_address,
    workplace_access,
    attire,
    attire_type,
    hair_style,
    nearest_station,
    location_notes,
    salary_type,
    raise_info,
    bonus_info,
    commute_allowance,
    job_category_detail,
    published_at,
    expires_at
  )
  VALUES (
    p_job->>'title',
    COALESCE(NULLIF(p_job->>'job_code', ''), generate_unique_job_code()),
    p_job->>'area',
    CASE
      WHEN p_job ? 'search_areas' THEN ARRAY(SELECT jsonb_array_elements_text(p_job->'search_areas'))
      ELSE ARRAY[]::text[]
    END,
    p_job->>'type',
    p_job->>'salary',
    p_job->>'category',
    CASE
      WHEN p_job ? 'tags' THEN ARRAY(SELECT jsonb_array_elements_text(p_job->'tags'))
      ELSE ARRAY[]::text[]
    END,
    NULLIF(p_job->>'client_id', '')::uuid,
    NULLIF(p_job->>'description', ''),
    NULLIF(p_job->>'requirements', ''),
    NULLIF(p_job->>'working_hours', ''),
    NULLIF(p_job->>'holidays', ''),
    NULLIF(p_job->>'benefits', ''),
    NULLIF(p_job->>'selection_process', ''),
    NULLIF(p_job->>'hourly_wage', '')::integer,
    NULLIF(p_job->>'salary_description', ''),
    NULLIF(p_job->>'period', ''),
    NULLIF(p_job->>'start_date', ''),
    NULLIF(p_job->>'workplace_name', ''),
    NULLIF(p_job->>'workplace_address', ''),
    NULLIF(p_job->>'workplace_access', ''),
    NULLIF(p_job->>'attire', ''),
    NULLIF(p_job->>'attire_type', ''),
    NULLIF(p_job->>'hair_style', ''),
    NULLIF(p_job->>'nearest_station', ''),
    NULLIF(p_job->>'location_notes', ''),
    NULLIF(p_job->>'salary_type', ''),
    NULLIF(p_job->>'raise_info', ''),
    NULLIF(p_job->>'bonus_info', ''),
    NULLIF(p_job->>'commute_allowance', ''),
    NULLIF(p_job->>'job_category_detail', ''),
    COALESCE(NULLIF(p_job->>'published_at', '')::timestamptz, now()),
    NULLIF(p_job->>'expires_at', '')::timestamptz
  )
  RETURNING id, type INTO v_job_id, v_type;

  IF v_type IN ('派遣', '紹介予定派遣') THEN
    INSERT INTO dispatch_job_details (
      id,
      client_company_name,
      is_client_company_public,
      training_salary,
      training_period,
      end_date,
      actual_work_hours,
      work_days_per_week,
      nail_policy,
      shift_notes,
      general_notes
    )
    VALUES (
      v_job_id,
      NULLIF(p_dispatch->>'client_company_name', ''),
      COALESCE((p_dispatch->>'is_client_company_public')::boolean, false),
      NULLIF(p_dispatch->>'training_salary', ''),
      NULLIF(p_dispatch->>'training_period', ''),
      NULLIF(p_dispatch->>'end_date', ''),
      NULLIF(p_dispatch->>'actual_work_hours', ''),
      NULLIF(p_dispatch->>'work_days_per_week', ''),
      NULLIF(p_dispatch->>'nail_policy', ''),
      NULLIF(p_dispatch->>'shift_notes', ''),
      NULLIF(p_dispatch->>'general_notes', '')
    );
  ELSIF v_type IN ('正社員', '契約社員') THEN
    INSERT INTO fulltime_job_details (
      id,
      company_name,
      is_company_name_public,
      company_address,
      industry,
      company_size,
      established_date,
      company_overview,
      business_overview,
      annual_salary_min,
      annual_salary_max,
      overtime_hours,
      annual_holidays,
      probation_period,
      probation_details,
      part_time_available,
      smoking_policy,
      appeal_points,
      welcome_requirements,
      department_details,
      recruitment_background,
      company_url,
      education_training,
      representative,
      capital,
      work_location_detail,
      salary_detail,
      transfer_policy,
      salary_example,
      bonus,
      raise,
      annual_revenue,
      onboarding_process,
      interview_location,
      salary_breakdown,
      shift_notes
    )
    VALUES (
      v_job_id,
      NULLIF(p_fulltime->>'company_name', ''),
      COALESCE((p_fulltime->>'is_company_name_public')::boolean, true),
      NULLIF(p_fulltime->>'company_address', ''),
      NULLIF(p_fulltime->>'industry', ''),
      NULLIF(p_fulltime->>'company_size', ''),
      NULLIF(p_fulltime->>'established_date', ''),
      NULLIF(p_fulltime->>'company_overview', ''),
      NULLIF(p_fulltime->>'business_overview', ''),
      NULLIF(p_fulltime->>'annual_salary_min', '')::integer,
      NULLIF(p_fulltime->>'annual_salary_max', '')::integer,
      NULLIF(p_fulltime->>'overtime_hours', ''),
      NULLIF(p_fulltime->>'annual_holidays', ''),
      NULLIF(p_fulltime->>'probation_period', ''),
      NULLIF(p_fulltime->>'probation_details', ''),
      COALESCE((p_fulltime->>'part_time_available')::boolean, false),
      NULLIF(p_fulltime->>'smoking_policy', ''),
      NULLIF(p_fulltime->>'appeal_points', ''),
      NULLIF(p_fulltime->>'welcome_requirements', ''),
      NULLIF(p_fulltime->>'department_details', ''),
      NULLIF(p_fulltime->>'recruitment_background', ''),
      NULLIF(p_fulltime->>'company_url', ''),
      NULLIF(p_fulltime->>'education_training', ''),
      NULLIF(p_fulltime->>'representative', ''),
      NULLIF(p_fulltime->>'capital', ''),
      NULLIF(p_fulltime->>'work_location_detail', ''),
      NULLIF(p_fulltime->>'salary_detail', ''),
      NULLIF(p_fulltime->>'transfer_policy', ''),
      NULLIF(p_fulltime->>'salary_example', ''),
      NULLIF(p_fulltime->>'bonus', ''),
      NULLIF(p_fulltime->>'raise', ''),
      NULLIF(p_fulltime->>'annual_revenue', ''),
      NULLIF(p_fulltime->>'onboarding_process', ''),
      NULLIF(p_fulltime->>'interview_location', ''),
      NULLIF(p_fulltime->>'salary_breakdown', ''),
      NULLIF(p_fulltime->>'shift_notes', '')
    );
  END IF;

  RETURN v_job_id;
END;
$$;
GRANT EXECUTE ON FUNCTION generate_unique_job_code() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_unique_job_code() TO service_role;
GRANT EXECUTE ON FUNCTION create_job_with_details(jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_job_with_details(jsonb, jsonb, jsonb) TO service_role;
CREATE OR REPLACE FUNCTION update_job_with_details(
  p_job_id uuid,
  p_job jsonb,
  p_dispatch jsonb DEFAULT NULL,
  p_fulltime jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_type text;
BEGIN
  UPDATE jobs
  SET
    title = p_job->>'title',
    area = p_job->>'area',
    search_areas = CASE
      WHEN p_job ? 'search_areas' THEN ARRAY(SELECT jsonb_array_elements_text(p_job->'search_areas'))
      ELSE ARRAY[]::text[]
    END,
    type = p_job->>'type',
    salary = p_job->>'salary',
    category = p_job->>'category',
    tags = CASE
      WHEN p_job ? 'tags' THEN ARRAY(SELECT jsonb_array_elements_text(p_job->'tags'))
      ELSE ARRAY[]::text[]
    END,
    client_id = NULLIF(p_job->>'client_id', '')::uuid,
    description = NULLIF(p_job->>'description', ''),
    requirements = NULLIF(p_job->>'requirements', ''),
    working_hours = NULLIF(p_job->>'working_hours', ''),
    holidays = NULLIF(p_job->>'holidays', ''),
    benefits = NULLIF(p_job->>'benefits', ''),
    selection_process = NULLIF(p_job->>'selection_process', ''),
    hourly_wage = NULLIF(p_job->>'hourly_wage', '')::integer,
    salary_description = NULLIF(p_job->>'salary_description', ''),
    period = NULLIF(p_job->>'period', ''),
    start_date = NULLIF(p_job->>'start_date', ''),
    workplace_name = NULLIF(p_job->>'workplace_name', ''),
    workplace_address = NULLIF(p_job->>'workplace_address', ''),
    workplace_access = NULLIF(p_job->>'workplace_access', ''),
    attire = NULLIF(p_job->>'attire', ''),
    attire_type = NULLIF(p_job->>'attire_type', ''),
    hair_style = NULLIF(p_job->>'hair_style', ''),
    nearest_station = NULLIF(p_job->>'nearest_station', ''),
    location_notes = NULLIF(p_job->>'location_notes', ''),
    salary_type = NULLIF(p_job->>'salary_type', ''),
    raise_info = NULLIF(p_job->>'raise_info', ''),
    bonus_info = NULLIF(p_job->>'bonus_info', ''),
    commute_allowance = NULLIF(p_job->>'commute_allowance', ''),
    job_category_detail = NULLIF(p_job->>'job_category_detail', ''),
    published_at = COALESCE(NULLIF(p_job->>'published_at', '')::timestamptz, published_at),
    expires_at = NULLIF(p_job->>'expires_at', '')::timestamptz
  WHERE id = p_job_id
  RETURNING type INTO v_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found: %', p_job_id;
  END IF;

  IF v_type IN ('派遣', '紹介予定派遣') THEN
    INSERT INTO dispatch_job_details (
      id,
      client_company_name,
      is_client_company_public,
      training_salary,
      training_period,
      end_date,
      actual_work_hours,
      work_days_per_week,
      nail_policy,
      shift_notes,
      general_notes
    )
    VALUES (
      p_job_id,
      NULLIF(p_dispatch->>'client_company_name', ''),
      COALESCE((p_dispatch->>'is_client_company_public')::boolean, false),
      NULLIF(p_dispatch->>'training_salary', ''),
      NULLIF(p_dispatch->>'training_period', ''),
      NULLIF(p_dispatch->>'end_date', ''),
      NULLIF(p_dispatch->>'actual_work_hours', ''),
      NULLIF(p_dispatch->>'work_days_per_week', ''),
      NULLIF(p_dispatch->>'nail_policy', ''),
      NULLIF(p_dispatch->>'shift_notes', ''),
      NULLIF(p_dispatch->>'general_notes', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      client_company_name = EXCLUDED.client_company_name,
      is_client_company_public = EXCLUDED.is_client_company_public,
      training_salary = EXCLUDED.training_salary,
      training_period = EXCLUDED.training_period,
      end_date = EXCLUDED.end_date,
      actual_work_hours = EXCLUDED.actual_work_hours,
      work_days_per_week = EXCLUDED.work_days_per_week,
      nail_policy = EXCLUDED.nail_policy,
      shift_notes = EXCLUDED.shift_notes,
      general_notes = EXCLUDED.general_notes;

    DELETE FROM fulltime_job_details WHERE id = p_job_id;
  ELSIF v_type IN ('正社員', '契約社員') THEN
    INSERT INTO fulltime_job_details (
      id,
      company_name,
      is_company_name_public,
      company_address,
      industry,
      company_size,
      established_date,
      company_overview,
      business_overview,
      annual_salary_min,
      annual_salary_max,
      overtime_hours,
      annual_holidays,
      probation_period,
      probation_details,
      part_time_available,
      smoking_policy,
      appeal_points,
      welcome_requirements,
      department_details,
      recruitment_background,
      company_url,
      education_training,
      representative,
      capital,
      work_location_detail,
      salary_detail,
      transfer_policy,
      salary_example,
      bonus,
      raise,
      annual_revenue,
      onboarding_process,
      interview_location,
      salary_breakdown,
      shift_notes
    )
    VALUES (
      p_job_id,
      NULLIF(p_fulltime->>'company_name', ''),
      COALESCE((p_fulltime->>'is_company_name_public')::boolean, true),
      NULLIF(p_fulltime->>'company_address', ''),
      NULLIF(p_fulltime->>'industry', ''),
      NULLIF(p_fulltime->>'company_size', ''),
      NULLIF(p_fulltime->>'established_date', ''),
      NULLIF(p_fulltime->>'company_overview', ''),
      NULLIF(p_fulltime->>'business_overview', ''),
      NULLIF(p_fulltime->>'annual_salary_min', '')::integer,
      NULLIF(p_fulltime->>'annual_salary_max', '')::integer,
      NULLIF(p_fulltime->>'overtime_hours', ''),
      NULLIF(p_fulltime->>'annual_holidays', ''),
      NULLIF(p_fulltime->>'probation_period', ''),
      NULLIF(p_fulltime->>'probation_details', ''),
      COALESCE((p_fulltime->>'part_time_available')::boolean, false),
      NULLIF(p_fulltime->>'smoking_policy', ''),
      NULLIF(p_fulltime->>'appeal_points', ''),
      NULLIF(p_fulltime->>'welcome_requirements', ''),
      NULLIF(p_fulltime->>'department_details', ''),
      NULLIF(p_fulltime->>'recruitment_background', ''),
      NULLIF(p_fulltime->>'company_url', ''),
      NULLIF(p_fulltime->>'education_training', ''),
      NULLIF(p_fulltime->>'representative', ''),
      NULLIF(p_fulltime->>'capital', ''),
      NULLIF(p_fulltime->>'work_location_detail', ''),
      NULLIF(p_fulltime->>'salary_detail', ''),
      NULLIF(p_fulltime->>'transfer_policy', ''),
      NULLIF(p_fulltime->>'salary_example', ''),
      NULLIF(p_fulltime->>'bonus', ''),
      NULLIF(p_fulltime->>'raise', ''),
      NULLIF(p_fulltime->>'annual_revenue', ''),
      NULLIF(p_fulltime->>'onboarding_process', ''),
      NULLIF(p_fulltime->>'interview_location', ''),
      NULLIF(p_fulltime->>'salary_breakdown', ''),
      NULLIF(p_fulltime->>'shift_notes', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      is_company_name_public = EXCLUDED.is_company_name_public,
      company_address = EXCLUDED.company_address,
      industry = EXCLUDED.industry,
      company_size = EXCLUDED.company_size,
      established_date = EXCLUDED.established_date,
      company_overview = EXCLUDED.company_overview,
      business_overview = EXCLUDED.business_overview,
      annual_salary_min = EXCLUDED.annual_salary_min,
      annual_salary_max = EXCLUDED.annual_salary_max,
      overtime_hours = EXCLUDED.overtime_hours,
      annual_holidays = EXCLUDED.annual_holidays,
      probation_period = EXCLUDED.probation_period,
      probation_details = EXCLUDED.probation_details,
      part_time_available = EXCLUDED.part_time_available,
      smoking_policy = EXCLUDED.smoking_policy,
      appeal_points = EXCLUDED.appeal_points,
      welcome_requirements = EXCLUDED.welcome_requirements,
      department_details = EXCLUDED.department_details,
      recruitment_background = EXCLUDED.recruitment_background,
      company_url = EXCLUDED.company_url,
      education_training = EXCLUDED.education_training,
      representative = EXCLUDED.representative,
      capital = EXCLUDED.capital,
      work_location_detail = EXCLUDED.work_location_detail,
      salary_detail = EXCLUDED.salary_detail,
      transfer_policy = EXCLUDED.transfer_policy,
      salary_example = EXCLUDED.salary_example,
      bonus = EXCLUDED.bonus,
      raise = EXCLUDED.raise,
      annual_revenue = EXCLUDED.annual_revenue,
      onboarding_process = EXCLUDED.onboarding_process,
      interview_location = EXCLUDED.interview_location,
      salary_breakdown = EXCLUDED.salary_breakdown,
      shift_notes = EXCLUDED.shift_notes;

    DELETE FROM dispatch_job_details WHERE id = p_job_id;
  ELSE
    DELETE FROM dispatch_job_details WHERE id = p_job_id;
    DELETE FROM fulltime_job_details WHERE id = p_job_id;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION update_job_with_details(uuid, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_job_with_details(uuid, jsonb, jsonb, jsonb) TO service_role;
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
GRANT EXECUTE ON FUNCTION get_public_jobs_list_rpc(text, text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_jobs_list_rpc(text, text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION search_jobs_by_area_rpc(text, text, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_jobs_by_area_rpc(text, text, uuid, integer) TO service_role;
