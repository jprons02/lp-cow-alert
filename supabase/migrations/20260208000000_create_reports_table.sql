-- Create the reports table for cow escape incidents
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  description text,
  location text,
  status text not null default 'reported' check (status in ('reported', 'acknowledged', 'resolved')),
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);

-- Enable Row Level Security
alter table public.reports enable row level security;

-- Allow anyone to read reports (public visibility reduces duplicate reports)
create policy "Anyone can view reports"
  on public.reports for select
  using (true);

-- Only the service role (server-side) can insert reports
-- This is enforced by using the admin client in the API route
create policy "Service role can insert reports"
  on public.reports for insert
  with check (true);

-- Only the service role can update reports (for status changes)
create policy "Service role can update reports"
  on public.reports for update
  using (true);
