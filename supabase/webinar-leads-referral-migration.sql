-- Support webinar signups that come from a direct link (WhatsApp groups etc.)
-- instead of only the Facebook Lead Ad, with a referral code for attribution.
alter table webinar_leads alter column fb_lead_id drop not null;
alter table webinar_leads add column if not exists source text not null default 'facebook';
alter table webinar_leads add column if not exists referral_code text;

create index if not exists webinar_leads_referral_code_idx on webinar_leads(referral_code);
