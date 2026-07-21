alter table coaching_homework_items
  add column if not exists parent_item_id uuid references coaching_homework_items(id) on delete cascade;

create index if not exists coaching_homework_items_parent_idx
  on coaching_homework_items (parent_item_id, created_at);
