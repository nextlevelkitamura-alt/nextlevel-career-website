-- Allow Admins to View All Profiles
-- We use a subquery to check if the requesting user is an admin.
-- Since users can already view their own profile, the subquery checking their own 'is_admin' status is safe from recursion issues in most contexts, 
-- but to be safe and efficient, we ensure the existing "Users can view own profile" policy handles the base case.

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    );

-- Allow Admins to Update All Profiles (e.g., to promote/demote users)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (
        (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    )
    WITH CHECK (
        (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    );

-- Reload schema cache
NOTIFY pgrst, 'reload config';
