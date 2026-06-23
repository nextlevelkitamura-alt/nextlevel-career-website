-- 日付選択型 相談求人LP用テーブル
-- 既存の jobs / consultation_bookings は変更しない。

CREATE TABLE IF NOT EXISTS consultation_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  target_employment_type text NOT NULL CHECK (target_employment_type IN ('dispatch', 'fulltime', 'mixed')),
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultation_booking_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES consultation_routes(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('visit', 'online')),
  label text NOT NULL,
  booking_url text NOT NULL,
  chips text[] NOT NULL DEFAULT '{}',
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(route_id, mode)
);

CREATE TABLE IF NOT EXISTS consultation_available_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_option_id uuid NOT NULL REFERENCES consultation_booking_options(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
  note text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_option_id, available_date)
);

CREATE TABLE IF NOT EXISTS consultation_date_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  available_date_id uuid NOT NULL REFERENCES consultation_available_dates(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  highlight_label text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(available_date_id, job_id)
);

CREATE TABLE IF NOT EXISTS consultation_lp_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_slug text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('visit', 'online')),
  selected_date date,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  click_type text NOT NULL CHECK (click_type IN ('booking', 'job_detail')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consultation_routes_active_order_idx
  ON consultation_routes(is_active, display_order);

CREATE INDEX IF NOT EXISTS consultation_booking_options_route_order_idx
  ON consultation_booking_options(route_id, is_active, display_order);

CREATE INDEX IF NOT EXISTS consultation_available_dates_option_date_idx
  ON consultation_available_dates(booking_option_id, available_date);

CREATE INDEX IF NOT EXISTS consultation_available_dates_status_idx
  ON consultation_available_dates(status);

CREATE INDEX IF NOT EXISTS consultation_date_jobs_date_order_idx
  ON consultation_date_jobs(available_date_id, display_order);

CREATE INDEX IF NOT EXISTS consultation_date_jobs_job_id_idx
  ON consultation_date_jobs(job_id);

CREATE INDEX IF NOT EXISTS consultation_lp_clicks_clicked_at_idx
  ON consultation_lp_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS consultation_lp_clicks_route_date_idx
  ON consultation_lp_clicks(route_slug, mode, selected_date);

CREATE INDEX IF NOT EXISTS consultation_lp_clicks_job_id_idx
  ON consultation_lp_clicks(job_id);

CREATE OR REPLACE FUNCTION update_consultation_lp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_consultation_routes_updated_at ON consultation_routes;
CREATE TRIGGER update_consultation_routes_updated_at
  BEFORE UPDATE ON consultation_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_lp_updated_at();

DROP TRIGGER IF EXISTS update_consultation_booking_options_updated_at ON consultation_booking_options;
CREATE TRIGGER update_consultation_booking_options_updated_at
  BEFORE UPDATE ON consultation_booking_options
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_lp_updated_at();

DROP TRIGGER IF EXISTS update_consultation_available_dates_updated_at ON consultation_available_dates;
CREATE TRIGGER update_consultation_available_dates_updated_at
  BEFORE UPDATE ON consultation_available_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_lp_updated_at();

ALTER TABLE consultation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_booking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_available_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_date_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_lp_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active consultation routes" ON consultation_routes;
CREATE POLICY "Public can read active consultation routes"
  ON consultation_routes FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can read all consultation routes" ON consultation_routes;
CREATE POLICY "Admins can read all consultation routes"
  ON consultation_routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert consultation routes" ON consultation_routes;
CREATE POLICY "Admins can insert consultation routes"
  ON consultation_routes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update consultation routes" ON consultation_routes;
CREATE POLICY "Admins can update consultation routes"
  ON consultation_routes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete consultation routes" ON consultation_routes;
CREATE POLICY "Admins can delete consultation routes"
  ON consultation_routes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Public can read active consultation booking options" ON consultation_booking_options;
CREATE POLICY "Public can read active consultation booking options"
  ON consultation_booking_options FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM consultation_routes
      WHERE consultation_routes.id = consultation_booking_options.route_id
        AND consultation_routes.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can read all consultation booking options" ON consultation_booking_options;
CREATE POLICY "Admins can read all consultation booking options"
  ON consultation_booking_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert consultation booking options" ON consultation_booking_options;
CREATE POLICY "Admins can insert consultation booking options"
  ON consultation_booking_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update consultation booking options" ON consultation_booking_options;
CREATE POLICY "Admins can update consultation booking options"
  ON consultation_booking_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete consultation booking options" ON consultation_booking_options;
CREATE POLICY "Admins can delete consultation booking options"
  ON consultation_booking_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Public can read consultation available dates" ON consultation_available_dates;
CREATE POLICY "Public can read consultation available dates"
  ON consultation_available_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultation_booking_options
      JOIN consultation_routes ON consultation_routes.id = consultation_booking_options.route_id
      WHERE consultation_booking_options.id = consultation_available_dates.booking_option_id
        AND consultation_booking_options.is_active = true
        AND consultation_routes.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can read all consultation available dates" ON consultation_available_dates;
CREATE POLICY "Admins can read all consultation available dates"
  ON consultation_available_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert consultation available dates" ON consultation_available_dates;
CREATE POLICY "Admins can insert consultation available dates"
  ON consultation_available_dates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update consultation available dates" ON consultation_available_dates;
CREATE POLICY "Admins can update consultation available dates"
  ON consultation_available_dates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete consultation available dates" ON consultation_available_dates;
CREATE POLICY "Admins can delete consultation available dates"
  ON consultation_available_dates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Public can read consultation date jobs" ON consultation_date_jobs;
CREATE POLICY "Public can read consultation date jobs"
  ON consultation_date_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultation_available_dates
      JOIN consultation_booking_options ON consultation_booking_options.id = consultation_available_dates.booking_option_id
      JOIN consultation_routes ON consultation_routes.id = consultation_booking_options.route_id
      WHERE consultation_available_dates.id = consultation_date_jobs.available_date_id
        AND consultation_booking_options.is_active = true
        AND consultation_routes.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can read all consultation date jobs" ON consultation_date_jobs;
CREATE POLICY "Admins can read all consultation date jobs"
  ON consultation_date_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert consultation date jobs" ON consultation_date_jobs;
CREATE POLICY "Admins can insert consultation date jobs"
  ON consultation_date_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update consultation date jobs" ON consultation_date_jobs;
CREATE POLICY "Admins can update consultation date jobs"
  ON consultation_date_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete consultation date jobs" ON consultation_date_jobs;
CREATE POLICY "Admins can delete consultation date jobs"
  ON consultation_date_jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Anyone can insert consultation LP clicks" ON consultation_lp_clicks;
CREATE POLICY "Anyone can insert consultation LP clicks"
  ON consultation_lp_clicks FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can select consultation LP clicks" ON consultation_lp_clicks;
CREATE POLICY "Admins can select consultation LP clicks"
  ON consultation_lp_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

NOTIFY pgrst, 'reload config';
