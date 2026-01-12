# Supabase Storage Fix (Corrected)

The previous error `must be owner of table objects` occurred because we tried to modify a system table (`storage.objects`) which is restricted.
We only need to create the bucket and policies. Please run this corrected SQL.

```sql
-- 1. Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-documents', 'job-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Policy: Allow Admins to Upload/Update/Delete
-- First drop to ensure we can recreate it
DROP POLICY IF EXISTS "Admin Manage" ON storage.objects;

CREATE POLICY "Admin Manage" ON storage.objects
FOR ALL
TO authenticated
USING ( bucket_id = 'job-documents' )
WITH CHECK ( bucket_id = 'job-documents' );

-- 3. Create Policy: Allow Everyone to View/Download
DROP POLICY IF EXISTS "Public View" ON storage.objects;

CREATE POLICY "Public View" ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'job-documents' );
```
