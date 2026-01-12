-- Add admin_memo column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS admin_memo text;

-- Reload schema cache
NOTIFY pgrst, 'reload config';
