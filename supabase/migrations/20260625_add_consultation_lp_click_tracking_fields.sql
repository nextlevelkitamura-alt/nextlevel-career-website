-- /consult-jobs banner analytics: anonymous visitor and bot metadata.
ALTER TABLE consultation_lp_clicks
  ADD COLUMN IF NOT EXISTS visitor_hash text,
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS consultation_lp_clicks_visitor_hash_idx
  ON consultation_lp_clicks(visitor_hash);

CREATE INDEX IF NOT EXISTS consultation_lp_clicks_not_bot_clicked_at_idx
  ON consultation_lp_clicks(clicked_at DESC)
  WHERE is_bot = false;

CREATE INDEX IF NOT EXISTS consultation_lp_clicks_route_not_bot_idx
  ON consultation_lp_clicks(route_slug, clicked_at DESC)
  WHERE is_bot = false;
