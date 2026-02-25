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
