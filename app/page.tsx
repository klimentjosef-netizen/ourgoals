import { redirect } from "next/navigation";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "./(marketing)/page";

export default async function Home() {
  if (DEV_MODE) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
