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
