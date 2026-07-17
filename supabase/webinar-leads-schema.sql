-- Facebook Lead Ads leads for the open webinar (21.7.26) — "קלוד קוד לרבנים"
create table webinar_leads (
  id uuid primary key default gen_random_uuid(),
  fb_lead_id text not null unique,
  full_name text,
  email text not null,
  phone text,
  ad_id text,
  campaign_id text,
  form_id text,
  raw_payload jsonb,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index webinar_leads_email_idx on webinar_leads(email);
