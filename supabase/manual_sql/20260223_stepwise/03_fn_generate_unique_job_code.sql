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
