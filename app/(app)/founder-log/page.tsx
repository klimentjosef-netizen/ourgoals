import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFounderLogEntries } from "@/app/(app)/founder-log/actions";
import { LogList } from "@/components/domain/founder-log/log-list";

export default async function FounderLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const entries = await getFounderLogEntries(user.id);

  return <LogList entries={entries} />;
}
