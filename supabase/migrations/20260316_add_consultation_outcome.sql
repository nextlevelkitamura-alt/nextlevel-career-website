-- 面談予約に成約管理用カラムを追加
ALTER TABLE consultation_bookings
  ADD COLUMN IF NOT EXISTS outcome text DEFAULT 'pending'
    CHECK (outcome IN ('pending', 'placed', 'declined', 'withdrawn')),
  ADD COLUMN IF NOT EXISTS follow_up_date timestamptz,
  ADD COLUMN IF NOT EXISTS assigned_admin uuid REFERENCES auth.users(id);

-- outcome用インデックス
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_outcome
  ON consultation_bookings(outcome);

-- Supabase Realtime は既に有効化済み (consultation_bookings)
