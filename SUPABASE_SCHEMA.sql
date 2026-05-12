-- SUPABASE DATABASE SETUP & TROUBLESHOOTING
-- ---------------------------------------------------------
-- ERROR: "Could not find table 'public.profiles' in schema cache"
-- FIX: 
-- 1. Run this entire script in the Supabase SQL Editor.
-- 2. Go to Settings > API and click "Save" to refresh the schema cache.
-- 3. In the SQL Editor, you can also run: NOTIFY pgrst, 'reload schema';
--
-- ERROR: "email rate limit exceeded"
-- FIX:
-- 1. Go to Authentication > Providers > Email.
-- 2. Expand "Rate Limits" and increase "Rate limit for signup emails".
-- 3. Or wait 1 hour for the limit to reset.
-- ---------------------------------------------------------

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  age integer,
  avatar_url text,
  resume_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger Function to create profile automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, age)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    (new.raw_user_meta_data->>'age')::integer
  );
  return new;
end;
$$;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. TEST REGISTRATIONS TABLE
create table if not exists public.test_registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roll_number text unique not null,
  test_date date not null,
  status text check (status in ('upcoming', 'completed', 'in-progress', 'submitted', 'abandoned', 'cancelled')) default 'upcoming' not null,
  delays_used integer default 0,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TEST ANSWERS TABLE (For saving progress during tests)
create table if not exists public.test_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  registration_id uuid references public.test_registrations(id) on delete cascade not null,
  section text not null, -- 'listening', 'reading', 'writing', 'speaking'
  answers jsonb default '{}'::jsonb,
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TEST RESULTS TABLE
create table if not exists public.test_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  registration_id uuid references public.test_registrations(id) on delete cascade,
  roll_number text not null,
  listening_score decimal(3,1),
  reading_score decimal(3,1),
  writing_score decimal(3,1),
  speaking_score decimal(3,1),
  overall_band decimal(3,1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PRACTICE SESSIONS TABLE
create table if not exists public.practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  section text not null,
  duration_minutes integer not null,
  score decimal(4,1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.test_registrations enable row level security;
alter table public.test_results enable row level security;
alter table public.test_answers enable row level security;
alter table public.practice_sessions enable row level security;

-- RLS POLICIES (Using DO blocks to prevent errors on existing policies)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own profile') then
    create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can view own registrations') then
    create policy "Users can view own registrations" on public.test_registrations for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own registrations') then
    create policy "Users can insert own registrations" on public.test_registrations for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own registrations') then
    create policy "Users can update own registrations" on public.test_registrations for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can view own results') then
    create policy "Users can view own results" on public.test_results for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own results') then
    create policy "Users can insert own results" on public.test_results for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can view own answers') then
    create policy "Users can view own answers" on public.test_answers for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own answers') then
    create policy "Users can insert own answers" on public.test_answers for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own answers') then
    create policy "Users can update own answers" on public.test_answers for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can view own sessions') then
    create policy "Users can view own sessions" on public.practice_sessions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own sessions') then
    create policy "Users can insert own sessions" on public.practice_sessions for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- RESET CACHE COMMAND
NOTIFY pgrst, 'reload schema';
