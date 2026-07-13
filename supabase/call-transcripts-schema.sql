create table if not exists call_transcripts (
  fireflies_id text primary key,
  drive_file_id text references call_recordings_processed(drive_file_id),
  title text not null,
  contact_name text,
  call_date timestamptz,
  duration_seconds numeric,
  summary text,
  keywords jsonb,
  action_items text,
  transcript_text text,
  source text not null default 'phone',
  tags text[] not null default '{}',
  synced_at timestamptz not null default now()
);

create index if not exists call_transcripts_contact_name_idx on call_transcripts (contact_name);
create index if not exists call_transcripts_call_date_idx on call_transcripts (call_date);
create index if not exists call_transcripts_tags_idx on call_transcripts using gin (tags);
