-- Adds cohort support so round2 (26.7 + 2.8) can run alongside the original
-- round1 (12.7 + 19.7) registrations, with separate seat counts and Zoom links.
alter table rabanim_registrations
  add column if not exists cohort text not null default 'round1';

create index if not exists rabanim_registrations_cohort_idx on rabanim_registrations(cohort);
