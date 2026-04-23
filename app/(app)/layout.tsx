import { AppShell } from "@/components/domain/app-shell";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE, MOCK_ACTIVE_MODULES } from "@/lib/dev/mock-user";
import type { ModuleId } from "@/types/modules";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  let activeModules: ModuleId[];

  if (DEV_MODE) {
    activeModules = MOCK_ACTIVE_MODULES;
  } else {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("user_settings")
      .select("active_modules")
      .eq("profile_id", user.id)
      .single();
    activeModules = (settings?.active_modules ?? []) as ModuleId[];
  }

  return (
    <AppShell user={user} activeModules={activeModules}>
      {children}
    </AppShell>
  );
}
