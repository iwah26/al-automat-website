create table if not exists call_recordings_processed (
  drive_file_id text primary key,
  file_name text not null,
  blob_pathname text,
  blob_deleted boolean not null default false,
  fireflies_title text,
  privacy_locked boolean not null default false,
  created_at timestamptz not null default now()
);
