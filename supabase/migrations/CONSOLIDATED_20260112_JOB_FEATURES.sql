-- ==========================================
-- 1. Job Details Expansion
-- ==========================================

-- Add detailed columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS holidays text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS selection_process text;

-- Create applications table (if not exists)
CREATE TABLE IF NOT EXISTS applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'rejected', 'hired')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update applications" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ==========================================
-- 2. Job Options (Master Data)
-- ==========================================

create table if not exists job_options (
  id uuid default gen_random_uuid() primary key,
  category text not null, 
  label text not null,
  value text not null,
  created_at timestamptz default now()
);

alter table job_options enable row level security;

-- Drop exist policies to avoid error if re-running
drop policy if exists "Public can read job options" on job_options;
drop policy if exists "Admins can insert job options" on job_options;
drop policy if exists "Admins can update job options" on job_options;
drop policy if exists "Admins can delete job options" on job_options;

create policy "Public can read job options" on job_options
  for select using (true);

create policy "Admins can insert job options" on job_options
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update job options" on job_options
  for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete job options" on job_options
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ==========================================
-- 3. Fixes
-- ==========================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

NOTIFY pgrst, 'reload config';
