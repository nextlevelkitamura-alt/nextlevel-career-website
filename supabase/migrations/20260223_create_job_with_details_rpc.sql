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
    p_job->>'job_code',
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

GRANT EXECUTE ON FUNCTION create_job_with_details(jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_job_with_details(jsonb, jsonb, jsonb) TO service_role;
