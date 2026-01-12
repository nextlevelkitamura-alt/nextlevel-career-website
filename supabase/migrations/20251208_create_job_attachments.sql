-- Create job_attachments table
create table if not exists job_attachments (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table job_attachments enable row level security;

-- Policies
create policy "Public read access"
  on job_attachments for select
  using ( true );

create policy "Admin insert access"
  on job_attachments for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

create policy "Admin delete access"
  on job_attachments for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );
