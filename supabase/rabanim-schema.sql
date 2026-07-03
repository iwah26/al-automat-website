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
