-- ================================================================
-- FULL FIX: Run this in Supabase SQL Editor
-- Fixes infinite recursion in profiles RLS policies
-- ================================================================

-- Step 1: Create a security definer function to get role without triggering RLS
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Step 2: Drop ALL profile policies and recreate without recursion
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Coordinators can read all profiles" on profiles;
drop policy if exists "Allow profile insert" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Allow profile creation on signup" on profiles;
drop policy if exists "Allow profile insert during signup" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Coordinators can view all profiles" on profiles;

-- Read own profile OR coordinator reads all (using security definer fn — no recursion)
create policy "Profiles select policy"
  on profiles for select
  using (
    auth.uid() = id
    OR public.get_my_role() = 'coordinator'
  );

-- Allow insert from anyone (trigger + API route handle it safely)
create policy "Profiles insert policy"
  on profiles for insert
  with check (true);

-- Users update own profile
create policy "Profiles update policy"
  on profiles for update
  using (auth.uid() = id);

-- Step 3: Fix tasks policies (also uses subquery on profiles — use same function)
drop policy if exists "Coordinators can manage all tasks" on tasks;
drop policy if exists "Volunteers can insert own tasks" on tasks;
drop policy if exists "Volunteers can read own tasks" on tasks;
drop policy if exists "Users can view assigned tasks" on tasks;
drop policy if exists "Allow task insert" on tasks;

create policy "Tasks select policy"
  on tasks for select
  using (
    auth.uid() = assigned_to
    OR public.get_my_role() = 'coordinator'
  );

create policy "Tasks insert policy"
  on tasks for insert
  with check (
    auth.uid() = assigned_to
    OR public.get_my_role() = 'coordinator'
  );

create policy "Tasks update policy"
  on tasks for update
  using (
    auth.uid() = assigned_to
    OR public.get_my_role() = 'coordinator'
  );

-- Step 4: Also fix submissions policies if they exist
drop policy if exists "Volunteers can insert own submissions" on submissions;
drop policy if exists "Volunteers can read own submissions" on submissions;
drop policy if exists "Coordinators can read all submissions" on submissions;

create policy "Submissions select policy"
  on submissions for select
  using (
    auth.uid() = volunteer_id
    OR public.get_my_role() = 'coordinator'
  );

create policy "Submissions insert policy"
  on submissions for insert
  with check (auth.uid() = volunteer_id);

-- Step 5: Verify
select policyname, tablename, cmd from pg_policies
where tablename in ('profiles', 'tasks', 'submissions')
order by tablename, policyname;
