import type { User } from "@supabase/supabase-js";
import type { ModuleId } from "@/types/modules";

export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

export const MOCK_USER: User = {
  id: MOCK_USER_ID,
  email: "dev@ourgoals.app",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: { display_name: "Dev User" },
  created_at: new Date().toISOString(),
} as User;

export const MOCK_ACTIVE_MODULES: ModuleId[] = [
  "goals_habits",
  "sleep_wellbeing",
  "calendar",
  "work_focus",
  "training",
  "nutrition",
];
