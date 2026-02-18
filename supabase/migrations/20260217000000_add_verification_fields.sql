-- Add columns for photo verification, rate limiting, and GPS validation
alter table public.reports
  add column photo_base64 text,
  add column fingerprint text,
  add column ip_address text,
  add column reporter_lat double precision,
  add column reporter_lng double precision;

-- Indexes for rate-limit lookups (fingerprint + date, ip + date)
create index idx_reports_fingerprint_created on public.reports (fingerprint, created_at);
create index idx_reports_ip_created on public.reports (ip_address, created_at);
