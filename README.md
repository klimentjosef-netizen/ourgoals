# OurGoals

Life management app — training, nutrition, sleep, calendar, check-in, goals & family.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components)
- **Supabase** (Postgres, Auth, RLS, Storage)
- **Tailwind CSS v4** + shadcn/ui
- **Zustand** (client state)
- **Zod** (validation)
- **date-fns** (dates)

## Setup

```bash
# Install dependencies
npm install

# Copy env (fill in your Supabase keys)
cp .env.example .env.local

# Run Supabase migration
# Option A: paste supabase/migrations/0001_init.sql into Supabase SQL Editor
# Option B: npx supabase db push --db-url postgresql://...

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/(auth)/login     — Authentication
app/(app)/           — Protected app pages
  dashboard          — Daily overview, XP, streak, coach
  training           — Workout plans & logging
  nutrition          — Food logging & macros
  calendar           — Agenda, events, conflicts
  checkin            — Morning & evening rituals
  body               — Body metrics & trends
  settings           — User settings
  founder-log        — Product notes
  profile            — Gamification, achievements
components/ui/       — shadcn primitives
components/domain/   — App-specific components
lib/supabase/        — Supabase client setup
lib/logic/           — Business logic (macros, overload, streak)
lib/calendar/        — Calendar utilities
lib/flags/           — Feature flags
types/               — Zod schemas & TS types
supabase/migrations/ — Database migrations
tests/               — Vitest tests
```

## Design

- Colors: Green (#22c55e) + Gold (#d4a017)
- Fonts: Sora (headings & UI) + DM Mono (data)
- Theme: Auto (follows system preference)
- Mobile-first, bottom tab bar + FAB
