-- 相談予約の一元管理テーブル
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    provider text NOT NULL DEFAULT 'calcom',
    external_booking_id text,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
    click_type text CHECK (click_type IN ('apply', 'consult')),
    status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'rescheduled', 'completed', 'canceled', 'no_show')),
    attendee_name text,
    attendee_email text,
    attendee_phone text,
    starts_at timestamptz,
    ends_at timestamptz,
    timezone text,
    meeting_url text,
    admin_note text,
    raw_payload jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS consultation_bookings_provider_external_idx
    ON consultation_bookings(provider, external_booking_id)
    WHERE external_booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS consultation_bookings_user_id_idx ON consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS consultation_bookings_job_id_idx ON consultation_bookings(job_id);
CREATE INDEX IF NOT EXISTS consultation_bookings_status_idx ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS consultation_bookings_starts_at_idx ON consultation_bookings(starts_at DESC);

ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view consultation bookings"
    ON consultation_bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can insert consultation bookings"
    ON consultation_bookings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update consultation bookings"
    ON consultation_bookings FOR UPDATE
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
