create table if not exists coaching_homework_items (
  id uuid primary key default gen_random_uuid(),
  homework_number int not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists coaching_homework_items_number_idx
  on coaching_homework_items (homework_number, created_at);
