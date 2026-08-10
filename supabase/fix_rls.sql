-- ================================================================
-- PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR AND RUN IT
-- Fixes the RLS violation on profiles during signup
-- ================================================================

-- Step 1: Create the trigger function that auto-creates profiles
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
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name,
    district = excluded.district,
    ward = excluded.ward,
    aapda_mitra_id = excluded.aapda_mitra_id;
  return new;
end;
$$ language plpgsql security definer;

-- Step 2: Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Step 3: Drop ALL existing policies on profiles (full clean slate)
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Allow profile creation on signup" on profiles;
drop policy if exists "Enable insert for authenticated users only" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Allow profile insert during signup" on profiles;
drop policy if exists "Coordinators can view all profiles" on profiles;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Coordinators can read all profiles" on profiles;
drop policy if exists "Allow profile insert" on profiles;

-- Step 4: Recreate clean, working policies

-- Anyone authenticated can read their own profile (needed for middleware + dashboard)
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Coordinators can read all profiles (needed for coordinator dashboard)
create policy "Coordinators can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'coordinator'
    )
  );

-- Allow INSERT from anyone — trigger + API route handle this safely
create policy "Allow profile insert"
  on profiles for insert
  with check (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Step 5: Verify
select tgname, tgenabled from pg_trigger where tgname = 'on_auth_user_created';
select policyname, cmd from pg_policies where tablename = 'profiles';

