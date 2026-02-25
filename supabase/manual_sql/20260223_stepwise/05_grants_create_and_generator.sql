GRANT EXECUTE ON FUNCTION generate_unique_job_code() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_unique_job_code() TO service_role;
GRANT EXECUTE ON FUNCTION create_job_with_details(jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_job_with_details(jsonb, jsonb, jsonb) TO service_role;
