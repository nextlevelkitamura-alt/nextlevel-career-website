-- 1. Create a secure function to check admin status
-- "SECURITY DEFINER" means this function runs with the privileges of the creator (superuser), bypassing RLS recursion issues.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow Admins to View All Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING ( is_admin() );

-- 3. Allow Admins to Update All Profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING ( is_admin() )
    WITH CHECK ( is_admin() );

-- Reload schema cache
NOTIFY pgrst, 'reload config';
