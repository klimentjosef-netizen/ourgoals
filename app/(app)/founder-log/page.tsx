import { getAuthUser } from "@/lib/auth";
import { getFounderLogEntries } from "@/app/(app)/founder-log/actions";
import { LogList } from "@/components/domain/founder-log/log-list";

export default async function FounderLogPage() {
  const user = await getAuthUser();

  const entries = await getFounderLogEntries(user.id);

  return <LogList entries={entries} />;
}
