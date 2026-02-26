-- Internal-only listing source metadata for jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS listing_source_name text,
  ADD COLUMN IF NOT EXISTS listing_source_url text;

COMMENT ON COLUMN jobs.listing_source_name IS '掲載元サイト名（内部管理用・非公開）';
COMMENT ON COLUMN jobs.listing_source_url IS '掲載元URL（内部管理用・非公開）';

NOTIFY pgrst, 'reload config';
