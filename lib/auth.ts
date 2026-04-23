import type { User } from "@supabase/supabase-js";
import { DEV_MODE, MOCK_USER } from "@/lib/dev/mock-user";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getAuthUser(): Promise<User> {
  if (DEV_MODE) {
    return MOCK_USER;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
