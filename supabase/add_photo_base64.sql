-- Add photo_base64 column to submissions table so proof photos are displayable in coordinator dashboard
-- Run this in Supabase SQL Editor

alter table public.submissions
  add column if not exists photo_base64 text;

-- Confirm column was added
select column_name, data_type
from information_schema.columns
where table_name = 'submissions'
  and table_schema = 'public'
order by ordinal_position;
