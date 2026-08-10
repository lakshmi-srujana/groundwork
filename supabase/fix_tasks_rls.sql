-- ================================================================
-- Run this in Supabase SQL Editor to fix tasks RLS for volunteers
-- ================================================================

-- Allow volunteers to insert their own pledged tasks directly
drop policy if exists "Volunteers can insert own tasks" on tasks;
drop policy if exists "Allow task insert" on tasks;

create policy "Volunteers can insert own tasks"
  on tasks for insert
  with check (auth.uid() = assigned_to);

-- Allow volunteers to read tasks assigned to them
drop policy if exists "Volunteers can read own tasks" on tasks;
drop policy if exists "Users can view assigned tasks" on tasks;

create policy "Volunteers can read own tasks"
  on tasks for select
  using (auth.uid() = assigned_to);

-- Allow coordinators to read and insert all tasks
drop policy if exists "Coordinators can manage all tasks" on tasks;

create policy "Coordinators can manage all tasks"
  on tasks for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'coordinator'
    )
  );

-- Verify
select policyname, cmd from pg_policies where tablename = 'tasks';
