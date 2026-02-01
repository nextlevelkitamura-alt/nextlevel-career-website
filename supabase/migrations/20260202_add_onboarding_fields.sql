-- Add onboarding fields to profiles table
-- These fields are collected during the 3-step onboarding process

-- Add email column (for storing user email in profiles)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Add start_date column (for job start date preference - optional field)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date text;

-- Reload schema cache
NOTIFY pgrst, 'reload config';
