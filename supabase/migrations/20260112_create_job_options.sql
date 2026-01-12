create table job_options (
  id uuid default gen_random_uuid() primary key,
  category text not null, -- 'holiday', 'selection_process', etc.
  label text not null, -- Display text (e.g. "土日祝休み")
  value text not null, -- Template text (e.g. "完全週休2日制（土日祝）\n年間休日120日...")
  created_at timestamptz default now()
);

-- RLS: Public read, Admin write
alter table job_options enable row level security;

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

-- Reload schema cache
notify pgrst, 'reload config';
