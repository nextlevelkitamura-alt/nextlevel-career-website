-- Add detailed columns to jobs table for richer job descriptions
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hourly_wage integer;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_description text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS period text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS start_date text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workplace_name text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workplace_address text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workplace_access text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attire text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gender_ratio text;

-- Add comment to explain usage
COMMENT ON COLUMN jobs.hourly_wage IS 'Numeric hourly wage for sorting and filtering (e.g., 1400)';
COMMENT ON COLUMN jobs.salary_description IS 'Detailed description of salary, raises, etc.';
COMMENT ON COLUMN jobs.period IS 'Employment period (e.g., Long-term, 3 months+)';
COMMENT ON COLUMN jobs.start_date IS 'Job start date (e.g., ASAP, April 1st)';
COMMENT ON COLUMN jobs.workplace_name IS 'Name of the workplace (for candidate view)';
COMMENT ON COLUMN jobs.workplace_address IS 'Detailed address of the workplace';
COMMENT ON COLUMN jobs.workplace_access IS 'Access information (e.g., 5 min walk from Station X)';
COMMENT ON COLUMN jobs.attire IS 'Dress code / Hair rules';
COMMENT ON COLUMN jobs.gender_ratio IS 'Gender ratio of the workplace';
