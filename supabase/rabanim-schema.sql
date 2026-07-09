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

-- הוחלף ע"י rabanim_status_engagements: Green API לא שולח webhook על
-- תגובות/ריאקציות לסטטוס בכלל (רק endpoint לפולינג — getIncomingStatuses),
-- אז עברנו מ-webhook ל-cron שסורק כל כמה דקות.
drop table if exists rabanim_status_webhook_events;

-- תגובות/ריאקציות לסטטוסים של יצחק שזוהו דרך polling על getIncomingStatuses.
-- id_message ייחודי מונע שליחה כפולה של הקישור לאותו אירוע בין ריצות ה-cron.
create table if not exists rabanim_status_engagements (
  id uuid primary key default gen_random_uuid(),
  id_message text not null unique,
  phone text not null,
  message_type text,
  link_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists rabanim_status_engagements_phone_idx on rabanim_status_engagements(phone);

-- רשימה לבנה: רק תגובות/ריאקציות לסטטוסים שנרשמו כאן ידנית מפעילות שליחה
-- אוטומטית של הקישור — לא כל סטטוס שיצחק מעלה (רבים לא קשורים לסדנה).
create table if not exists rabanim_tracked_statuses (
  id_message text primary key,
  note text,
  created_at timestamptz not null default now()
);
