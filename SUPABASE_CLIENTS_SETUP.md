# Supabase Setup for Client Management

Please run the following SQL commands in your Supabase SQL Editor to set up the client management feature.

```sql
-- 1. Create clients table
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL UNIQUE
);

-- 2. Add client_id to jobs table
ALTER TABLE public.jobs 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- 3. Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for clients (Admin Only)
-- Allow admins to do everything
CREATE POLICY "Enable all for admins" ON public.clients
    FOR ALL
    TO authenticated
    USING (
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
    )
    WITH CHECK (
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
    );

-- Allow read-only access for authenticated users (optional, if needed for other features, but strictly admin for now)
-- If you want strictly admin-only, the above policy is sufficient.
```
