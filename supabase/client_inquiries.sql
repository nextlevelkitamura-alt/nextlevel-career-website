-- Create client_inquiries table
create table if not exists client_inquiries (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_person text not null,
  email text not null,
  phone text,
  message text,
  status text default '未対応' check (status in ('未対応', '対応中', '対応済')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table client_inquiries enable row level security;

-- Policy: Allow anyone (anon) to insert inquiries
create policy "Allow public to insert inquiries"
  on client_inquiries for insert
  with check (true);

-- Policy: Allow admins to view inquiries
-- Assuming 'profiles' table has 'is_admin' column and is linked to auth.users
create policy "Allow admins to view inquiries"
  on client_inquiries for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Policy: Allow admins to update inquiries
create policy "Allow admins to update inquiries"
  on client_inquiries for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );
