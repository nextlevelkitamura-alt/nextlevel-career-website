-- Add detailed columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS holidays text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS selection_process text;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'rejected', 'hired')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Prevent duplicate applications for the same job by the same user
  UNIQUE(job_id, user_id)
);

-- Enable RLS on applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policies for applications
-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications (assuming isAdmin check is handled via app logic or a separate admin role policy if needed)
-- For now, we will add a policy for specific admin users if needed, or rely on service_role for admin dashboard.
-- However, if we want admin users to query via client client (authenticated), we need a policy.
-- Let's look at how checkAdmin works in actions.ts. It checks `profiles`.`is_admin`.
-- We can add a policy using a subquery if we want perfect RLS, but for simplicity/performance often service_role is used in server actions.
-- Since we use Server Actions with `supabase-js`, if we createClient() it uses user auth.
-- Let's add a policy for admins based on the public.profiles table join.

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
