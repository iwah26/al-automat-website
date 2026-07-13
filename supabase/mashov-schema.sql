create table if not exists mashov_responses (
  id uuid primary key default gen_random_uuid(),
  respondent_name text not null,
  q1_strengths text,
  q2_weaknesses text,
  q3_fears text,
  q4_change text,
  q5_role text,
  created_at timestamptz not null default now()
);
