-- ============================================================
-- OurGoals — Initial Schema
-- Life management: training, nutrition, sleep, calendar,
-- check-in, goals, gamification & family
-- ============================================================

-- ======================== ENUMS =============================

create type visibility_type as enum ('private', 'household', 'partner');
create type household_role as enum ('owner', 'adult', 'child', 'viewer');
create type goal_status as enum ('active', 'completed', 'paused', 'abandoned');
create type exercise_category as enum ('push', 'pull', 'legs', 'core', 'cardio', 'mobility', 'compound');
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout');
create type food_source as enum ('manual', 'openfoodfacts', 'custom', 'public');
create type event_kind as enum ('training', 'work_deep', 'work_meeting', 'family', 'son', 'sleep', 'meal', 'custom', 'checkin');
create type coach_tone as enum ('strict_coach', 'friendly_mentor', 'calm_analyst', 'energetic_motivator', 'minimal');
create type detail_level as enum ('daily_checkin', 'weekly_summary', 'minimal');
create type partner_note_kind as enum ('gratitude', 'bother', 'request', 'celebrate');
create type shared_list_kind as enum ('groceries', 'todo', 'ideas', 'meal_plan');
create type founder_log_category as enum ('product', 'ux', 'emotional', 'technical', 'family_feedback');
create type achievement_category as enum ('streak', 'training', 'nutrition', 'sleep', 'consistency', 'social', 'milestone');

-- ======================== FUNCTIONS =========================

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Helper: check household membership
create or replace function is_household_member(p_household_id uuid, p_profile_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from household_members
    where household_id = p_household_id
      and profile_id = p_profile_id
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- IDENTITY & FAMILIES
-- ============================================================

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  locale text not null default 'cs',
  timezone text not null default 'Europe/Prague',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Households
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger households_updated_at before update on households
  for each row execute function update_updated_at();

alter table households enable row level security;

create policy "Household members can view"
  on households for select using (
    is_household_member(id, auth.uid())
  );
create policy "Owner can update"
  on households for update using (
    created_by = auth.uid()
  );
create policy "Authenticated can create"
  on households for insert with check (
    auth.uid() = created_by
  );

-- Household members
create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role household_role not null default 'adult',
  joined_at timestamptz not null default now(),
  primary key (household_id, profile_id)
);

alter table household_members enable row level security;

create policy "Members can view co-members"
  on household_members for select using (
    is_household_member(household_id, auth.uid())
  );
create policy "Household owner can manage members"
  on household_members for all using (
    exists (
      select 1 from households
      where id = household_id and created_by = auth.uid()
    )
  );

-- Household invites
create table household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  email text not null,
  role household_role not null default 'adult',
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table household_invites enable row level security;

create policy "Household owner can manage invites"
  on household_invites for all using (
    exists (
      select 1 from households
      where id = household_id and created_by = auth.uid()
    )
  );

-- ============================================================
-- USER SETTINGS & BODY
-- ============================================================

-- User settings
create table user_settings (
  profile_id uuid primary key references profiles(id) on delete cascade,
  target_weight numeric(5,1),
  target_bf numeric(4,1),
  tdee_override integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  bedtime_target time,
  wake_target time,
  coach_tone coach_tone not null default 'friendly_mentor',
  detail_level detail_level not null default 'daily_checkin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_settings_updated_at before update on user_settings
  for each row execute function update_updated_at();

alter table user_settings enable row level security;

create policy "Users can manage own settings"
  on user_settings for all using (auth.uid() = profile_id);

-- Body metrics (versioned, per profile per date)
create table body_metrics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,1),
  body_fat_pct numeric(4,1),
  waist_cm numeric(5,1),
  chest_cm numeric(5,1),
  hip_cm numeric(5,1),
  thigh_cm numeric(5,1),
  arm_cm numeric(5,1),
  sleep_hours numeric(3,1),
  morning_feel_1_10 smallint check (morning_feel_1_10 between 1 and 10),
  notes text,
  visibility visibility_type not null default 'private',
  household_id uuid references households(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, date)
);

create trigger body_metrics_updated_at before update on body_metrics
  for each row execute function update_updated_at();

alter table body_metrics enable row level security;

create policy "Own metrics"
  on body_metrics for all using (auth.uid() = profile_id);
create policy "Household metrics visible"
  on body_metrics for select using (
    visibility != 'private'
    and household_id is not null
    and is_household_member(household_id, auth.uid())
  );

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  metric text,
  target_value numeric(10,2),
  start_value numeric(10,2),
  current_value numeric(10,2),
  status goal_status not null default 'active',
  visibility visibility_type not null default 'private',
  household_id uuid references households(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger goals_updated_at before update on goals
  for each row execute function update_updated_at();

alter table goals enable row level security;

create policy "Own goals"
  on goals for all using (auth.uid() = profile_id);
create policy "Household goals visible"
  on goals for select using (
    visibility != 'private'
    and household_id is not null
    and is_household_member(household_id, auth.uid())
  );

-- ============================================================
-- TRAINING
-- ============================================================

-- Exercises catalog
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category exercise_category not null,
  primary_muscle text,
  secondary_muscles text[],
  equipment text,
  demo_url text,
  created_at timestamptz not null default now()
);

alter table exercises enable row level security;

create policy "Exercises are public read"
  on exercises for select using (true);
create policy "Authenticated can create exercises"
  on exercises for insert with check (auth.uid() is not null);

-- Training plans
create table training_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date,
  split_type text,
  days_per_week smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger training_plans_updated_at before update on training_plans
  for each row execute function update_updated_at();

alter table training_plans enable row level security;

create policy "Own training plans"
  on training_plans for all using (auth.uid() = profile_id);

-- Workouts (day templates within a plan)
create table workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references training_plans(id) on delete cascade,
  day_index smallint not null,
  day_label text not null,
  focus text,
  target_duration_min smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workouts_updated_at before update on workouts
  for each row execute function update_updated_at();

alter table workouts enable row level security;

create policy "Own workouts via plan"
  on workouts for all using (
    exists (
      select 1 from training_plans
      where id = plan_id and profile_id = auth.uid()
    )
  );

-- Workout exercises (exercises within a workout template)
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  order_idx smallint not null,
  exercise_id uuid not null references exercises(id),
  sets smallint not null default 3,
  reps_low smallint,
  reps_high smallint,
  rpe_target numeric(3,1),
  rest_sec smallint,
  notes text,
  created_at timestamptz not null default now()
);

alter table workout_exercises enable row level security;

create policy "Own workout exercises via workout"
  on workout_exercises for all using (
    exists (
      select 1 from workouts w
      join training_plans tp on tp.id = w.plan_id
      where w.id = workout_id and tp.profile_id = auth.uid()
    )
  );

-- Workout sessions (actual logged workouts)
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  workout_id uuid references workouts(id),
  date date not null,
  started_at timestamptz,
  completed_at timestamptz,
  mood_1_10 smallint check (mood_1_10 between 1 and 10),
  energy_1_10 smallint check (energy_1_10 between 1 and 10),
  notes text,
  visibility visibility_type not null default 'private',
  household_id uuid references households(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workout_sessions_updated_at before update on workout_sessions
  for each row execute function update_updated_at();

alter table workout_sessions enable row level security;

create policy "Own sessions"
  on workout_sessions for all using (auth.uid() = profile_id);
create policy "Household sessions visible"
  on workout_sessions for select using (
    visibility != 'private'
    and household_id is not null
    and is_household_member(household_id, auth.uid())
  );

-- Set logs (individual sets within a session)
create table set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_idx smallint not null,
  weight_kg numeric(6,2),
  reps smallint,
  rpe numeric(3,1),
  is_warmup boolean not null default false,
  completed_at timestamptz default now()
);

alter table set_logs enable row level security;

create policy "Own set logs via session"
  on set_logs for all using (
    exists (
      select 1 from workout_sessions
      where id = session_id and profile_id = auth.uid()
    )
  );

-- ============================================================
-- NUTRITION
-- ============================================================

-- Food items catalog
create table food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  kcal_per_100g numeric(6,1),
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  fiber_g numeric(5,1),
  source food_source not null default 'manual',
  owner_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger food_items_updated_at before update on food_items
  for each row execute function update_updated_at();

alter table food_items enable row level security;

create policy "Public food items readable"
  on food_items for select using (
    owner_id is null or owner_id = auth.uid()
  );
create policy "Own or public food items manageable"
  on food_items for all using (
    owner_id = auth.uid() or owner_id is null
  );

-- Meals
create table meals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  meal_type meal_type not null,
  consumed_at timestamptz,
  notes text,
  visibility visibility_type not null default 'private',
  household_id uuid references households(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger meals_updated_at before update on meals
  for each row execute function update_updated_at();

alter table meals enable row level security;

create policy "Own meals"
  on meals for all using (auth.uid() = profile_id);
create policy "Household meals visible"
  on meals for select using (
    visibility != 'private'
    and household_id is not null
    and is_household_member(household_id, auth.uid())
  );

-- Meal items (food within a meal)
create table meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  food_id uuid not null references food_items(id),
  grams numeric(7,1) not null,
  kcal_override numeric(6,1),
  protein_override numeric(5,1),
  carbs_override numeric(5,1),
  fat_override numeric(5,1),
  created_at timestamptz not null default now()
);

alter table meal_items enable row level security;

create policy "Own meal items via meal"
  on meal_items for all using (
    exists (
      select 1 from meals
      where id = meal_id and profile_id = auth.uid()
    )
  );

-- Meal templates
create table meal_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  meal_type meal_type,
  items jsonb not null default '[]',
  is_household boolean not null default false,
  household_id uuid references households(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger meal_templates_updated_at before update on meal_templates
  for each row execute function update_updated_at();

alter table meal_templates enable row level security;

create policy "Own templates"
  on meal_templates for all using (auth.uid() = owner_id);
create policy "Household templates visible"
  on meal_templates for select using (
    is_household = true
    and household_id is not null
    and is_household_member(household_id, auth.uid())
  );

-- ============================================================
-- CALENDAR
-- ============================================================

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  household_id uuid references households(id),
  title text not null,
  kind event_kind not null default 'custom',
  starts_at timestamptz,
  ends_at timestamptz,
  all_day boolean not null default false,
  rrule text,
  color text,
  visibility visibility_type not null default 'private',
  notes text,
  linked_entity_type text,
  linked_entity_id uuid,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger calendar_events_updated_at before update on calendar_events
  for each row execute function update_updated_at();

alter table calendar_events enable row level security;

create policy "Own events"
  on calendar_events for all using (auth.uid() = owner_id);
create policy "Household events visible"
  on calendar_events for select using (
    visibility != 'private'
    and household_id is not null
    and is_household_member(household_id, auth.uid())
  );

-- ============================================================
-- CHECK-IN & REFLECTIONS
-- ============================================================

-- Daily check-ins
create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  morning_ritual_done boolean not null default false,
  evening_ritual_done boolean not null default false,
  mood_1_10 smallint check (mood_1_10 between 1 and 10),
  energy_1_10 smallint check (energy_1_10 between 1 and 10),
  stress_1_10 smallint check (stress_1_10 between 1 and 10),
  steps integer,
  caffeine_drinks smallint,
  alcohol_drinks smallint,
  meditation_min smallint,
  screen_time_min smallint,
  notes text,
  day_rating_1_10 smallint check (day_rating_1_10 between 1 and 10),
  best_thing text,
  worst_thing text,
  tomorrow_risk text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, date)
);

create trigger daily_checkins_updated_at before update on daily_checkins
  for each row execute function update_updated_at();

alter table daily_checkins enable row level security;

create policy "Own checkins"
  on daily_checkins for all using (auth.uid() = profile_id);

-- Weekly reviews
create table weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  wins text,
  struggles text,
  body_trend text,
  adherence_pct numeric(5,1),
  next_week_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, week_start)
);

create trigger weekly_reviews_updated_at before update on weekly_reviews
  for each row execute function update_updated_at();

alter table weekly_reviews enable row level security;

create policy "Own weekly reviews"
  on weekly_reviews for all using (auth.uid() = profile_id);

-- Founder log
create table founder_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  insight text not null,
  category founder_log_category not null,
  priority_1_5 smallint check (priority_1_5 between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger founder_log_updated_at before update on founder_log
  for each row execute function update_updated_at();

alter table founder_log enable row level security;

create policy "Own founder log"
  on founder_log for all using (auth.uid() = profile_id);

-- ============================================================
-- GAMIFICATION
-- ============================================================

-- XP ledger (immutable log of all XP earned)
create table xp_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  source_type text,
  source_id uuid,
  earned_at timestamptz not null default now()
);

alter table xp_ledger enable row level security;

create policy "Own XP"
  on xp_ledger for all using (auth.uid() = profile_id);

-- Profile gamification state (derived, but cached for perf)
create table gamification_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  total_xp integer not null default 0,
  level smallint not null default 1,
  title text not null default 'Nováček',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  perfect_days integer not null default 0,
  ok_days integer not null default 0,
  missed_days integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger gamification_profiles_updated_at before update on gamification_profiles
  for each row execute function update_updated_at();

alter table gamification_profiles enable row level security;

create policy "Own gamification profile"
  on gamification_profiles for all using (auth.uid() = profile_id);
create policy "Household gamification visible"
  on gamification_profiles for select using (
    exists (
      select 1 from household_members hm1
      join household_members hm2 on hm1.household_id = hm2.household_id
      where hm1.profile_id = auth.uid()
        and hm2.profile_id = gamification_profiles.profile_id
    )
  );

-- Achievements catalog
create table achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null,
  category achievement_category not null,
  icon text,
  xp_reward integer not null default 0,
  condition_json jsonb,
  created_at timestamptz not null default now()
);

alter table achievements enable row level security;

create policy "Achievements are public read"
  on achievements for select using (true);

-- User achievements (unlocked)
create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id),
  unlocked_at timestamptz not null default now(),
  unique (profile_id, achievement_id)
);

alter table user_achievements enable row level security;

create policy "Own achievements"
  on user_achievements for all using (auth.uid() = profile_id);
create policy "Household achievements visible"
  on user_achievements for select using (
    exists (
      select 1 from household_members hm1
      join household_members hm2 on hm1.household_id = hm2.household_id
      where hm1.profile_id = auth.uid()
        and hm2.profile_id = user_achievements.profile_id
    )
  );

-- Daily completion log (for streak calculation)
create table daily_completion (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  morning_checkin boolean not null default false,
  evening_checkin boolean not null default false,
  training_done boolean not null default false,
  training_required boolean not null default true,
  protein_target_met boolean not null default false,
  bedtime_target_met boolean not null default false,
  xp_earned integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'ok', 'perfect', 'missed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, date)
);

create trigger daily_completion_updated_at before update on daily_completion
  for each row execute function update_updated_at();

alter table daily_completion enable row level security;

create policy "Own daily completion"
  on daily_completion for all using (auth.uid() = profile_id);

-- ============================================================
-- PARTNER & FAMILY (skeleton, UI hidden behind feature flag)
-- ============================================================

-- Partner notes (Gottman-based)
create table partner_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  target_profile_id uuid references profiles(id),
  kind partner_note_kind not null,
  content text not null,
  date date not null default current_date,
  is_read boolean not null default false,
  read_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger partner_notes_updated_at before update on partner_notes
  for each row execute function update_updated_at();

alter table partner_notes enable row level security;

create policy "Author can manage own notes"
  on partner_notes for all using (auth.uid() = author_id);
create policy "Target can read notes"
  on partner_notes for select using (
    auth.uid() = target_profile_id
    or is_household_member(household_id, auth.uid())
  );

-- Shared lists
create table shared_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  kind shared_list_kind not null default 'todo',
  items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger shared_lists_updated_at before update on shared_lists
  for each row execute function update_updated_at();

alter table shared_lists enable row level security;

create policy "Household members can manage lists"
  on shared_lists for all using (
    is_household_member(household_id, auth.uid())
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================

create index idx_body_metrics_profile_date on body_metrics(profile_id, date desc);
create index idx_goals_profile_status on goals(profile_id, status);
create index idx_workout_sessions_profile_date on workout_sessions(profile_id, date desc);
create index idx_set_logs_session on set_logs(session_id, exercise_id);
create index idx_meals_profile_date on meals(profile_id, date);
create index idx_meal_items_meal on meal_items(meal_id);
create index idx_calendar_events_owner_date on calendar_events(owner_id, starts_at);
create index idx_calendar_events_household on calendar_events(household_id, starts_at) where household_id is not null;
create index idx_daily_checkins_profile_date on daily_checkins(profile_id, date desc);
create index idx_xp_ledger_profile on xp_ledger(profile_id, earned_at desc);
create index idx_daily_completion_profile_date on daily_completion(profile_id, date desc);
create index idx_partner_notes_household on partner_notes(household_id, date desc);
create index idx_founder_log_profile on founder_log(profile_id, date desc);

-- ============================================================
-- AUTO-CREATE PROFILE on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  insert into user_settings (profile_id)
  values (new.id);

  insert into gamification_profiles (profile_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
