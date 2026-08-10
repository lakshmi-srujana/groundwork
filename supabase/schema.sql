-- Supabase Schema for Groundwork

-- Enable pgcrypto for UUIDs if not already enabled
create extension if not exists pgcrypto;

-- ================================================================
-- AUTO-CREATE PROFILE TRIGGER
-- Runs server-side when a new user signs up via Supabase Auth.
-- Reads role, full_name, district, ward from user_metadata set on signup.
-- ================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, district, ward, aapda_mitra_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'volunteer'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'district', ''),
    coalesce(new.raw_user_meta_data->>'ward', null),
    coalesce(new.raw_user_meta_data->>'aapda_mitra_id', null)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 1. profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('volunteer', 'coordinator')) not null,
  full_name text,
  district text,
  ward text,
  aapda_mitra_id text unique,
  created_at timestamptz default now()
);

-- 2. tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  item_name text,               -- what is being delivered (e.g. "water bottles")
  quantity integer,             -- how many
  district text not null,
  ward text,
  assigned_to uuid references profiles(id),
  assigned_by uuid references profiles(id),  -- null if self-pledged by volunteer
  is_self_pledged boolean default false,     -- true if volunteer created it themselves
  status text check (status in ('pending', 'submitted', 'verified', 'rejected')) default 'pending',
  due_date date,
  created_at timestamptz default now()
);

-- 3. submissions table
create table submissions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  volunteer_id uuid references profiles(id),
  photo_url text,           -- IPFS URL of proof photo
  ipfs_cid text,            -- raw IPFS CID
  geolocation jsonb,        -- { lat, lng, accuracy }
  exif_geotag jsonb,        -- extracted from photo EXIF
  face_detected boolean default false,
  ai_verdict text check (ai_verdict in ('verified', 'rejected', 'uncertain')),
  ai_confidence float,
  ai_notes text,            -- Gemini's reasoning
  blockchain_tx_hash text,  -- Polygon transaction hash
  blockchain_status text check (blockchain_status in ('pending', 'written', 'failed')) default 'pending',
  submitted_at timestamptz default now()
);

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table submissions enable row level security;

-- Policies for 'profiles'
-- Users can read and update only their own profile
create policy "Users can read own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Coordinators can read all profiles
create policy "Coordinators can read all profiles"
  on profiles for select
  using ( (select role from profiles where id = auth.uid()) = 'coordinator' );


-- Policies for 'tasks'
-- Volunteers can read tasks where assigned_to = their id
create policy "Volunteers can read own tasks"
  on tasks for select
  using ( auth.uid() = assigned_to );

-- Volunteers can insert tasks where is_self_pledged = true and assigned_to = their own id
create policy "Volunteers can self-pledge tasks"
  on tasks for insert
  with check ( auth.uid() = assigned_to and is_self_pledged = true );
  
-- Volunteers can update tasks where assigned_to = their id (needed to mark as 'submitted')
create policy "Volunteers can update own tasks"
  on tasks for update
  using ( auth.uid() = assigned_to );

-- Coordinators can read all tasks
create policy "Coordinators can read all tasks"
  on tasks for select
  using ( (select role from profiles where id = auth.uid()) = 'coordinator' );

-- Coordinators can write (insert/update) all tasks
create policy "Coordinators can write all tasks"
  on tasks for insert
  with check ( (select role from profiles where id = auth.uid()) = 'coordinator' );
  
create policy "Coordinators can update all tasks"
  on tasks for update
  using ( (select role from profiles where id = auth.uid()) = 'coordinator' );


-- Policies for 'submissions'
-- Volunteers can insert and read only their own submissions
create policy "Volunteers can insert own submissions"
  on submissions for insert
  with check ( auth.uid() = volunteer_id );

create policy "Volunteers can read own submissions"
  on submissions for select
  using ( auth.uid() = volunteer_id );
  
-- Volunteers can update own submissions (needed when blockchain writes finish later)
create policy "Volunteers can update own submissions"
  on submissions for update
  using ( auth.uid() = volunteer_id );

-- Coordinators can read all submissions
create policy "Coordinators can read all submissions"
  on submissions for select
  using ( (select role from profiles where id = auth.uid()) = 'coordinator' );

-- Coordinators can update all submissions
create policy "Coordinators can update all submissions"
  on submissions for update
  using ( (select role from profiles where id = auth.uid()) = 'coordinator' );
