drop table if exists coaching_homework_items;

create table if not exists coaching_homeworks (
  id uuid primary key default gen_random_uuid(),
  number int not null,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists coaching_homework_items (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references coaching_homeworks(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists coaching_homework_items_homework_idx
  on coaching_homework_items (homework_id, created_at);
