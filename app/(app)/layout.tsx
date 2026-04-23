import { AppShell } from "@/components/domain/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ModuleId } from "@/types/modules";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_modules")
    .eq("profile_id", user.id)
    .single();

  const activeModules = (settings?.active_modules ?? []) as ModuleId[];

  return (
    <AppShell user={user} activeModules={activeModules}>
      {children}
    </AppShell>
  );
}
