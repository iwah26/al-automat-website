-- Rabanim workshop — run this once in the Supabase SQL editor
-- (project: separate from the navcheret Supabase project)

create table rabanim_registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  role text,
  community_name text,
  location text,
  payment_status text not null default 'pending', -- pending | paid
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table rabanim_course_access (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references rabanim_registrations(id),
  password text not null unique,
  device_ids jsonb not null default '[]'::jsonb,
  max_devices int not null default 2,
  created_at timestamptz not null default now()
);

create index rabanim_course_access_password_idx on rabanim_course_access(password);

-- מעקב קליקים על קישור ההרשמה — כדי לדעת מי הגיע דרך שליחה ישירה
-- (ולא לשלם עמלת אפיליאייט על מי שכבר הגיע ככה)
create table rabanim_link_clicks (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  clicked_at timestamptz not null default now(),
  user_agent text
);

create index rabanim_link_clicks_code_idx on rabanim_link_clicks(code);

-- מעקב אפיליאייט: איזה קוד הביא כל רישום, כדי שכל קודקוד יראה מי רכש דרכו
alter table rabanim_registrations add column if not exists referral_code text;
create index if not exists rabanim_registrations_referral_code_idx on rabanim_registrations(referral_code);

-- לוג גולמי של כל webhook שמגיע מ-Green API (בעיקר לזיהוי תגובות/ריאקציות לסטטוסים)
-- שלב 1: רק לוגינג לצפייה, כדי לראות payload אמיתי לפני שבונים לוגיקת auto-send
create table if not exists rabanim_status_webhook_events (
  id uuid primary key default gen_random_uuid(),
  type_webhook text,
  sender text,
  payload jsonb not null,
  matched_status_reply boolean not null default false,
  auto_link_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists rabanim_status_webhook_events_sender_idx on rabanim_status_webhook_events(sender);
