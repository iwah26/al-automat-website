-- שאלון networking לבעלי עסקים (6.9.26)
create table if not exists networking_applications (
  id uuid primary key default gen_random_uuid(),

  -- פרטים אישיים
  full_name    text not null,
  phone        text not null,
  email        text,
  city         text,

  -- העסק
  business_name text,
  business_field text,
  years_active  text,
  website       text,

  -- תוכן
  q_strengths    text,  -- במה אני טוב
  q_contribution text,  -- מה אני יכול לתרום לקבוצה
  q_gaps         text,  -- חוסרים בעסק
  q_needs        text,  -- מה הייתי רוצה שהקבוצה תיתן לי
  q_notes        text,  -- הערות חופשי

  created_at timestamptz not null default now()
);

alter table public.networking_applications enable row level security;
