import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: "demo@ourgoals.app",
    password: "demo-ourgoals-2026",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message, hint: "Demo účet neexistuje nebo heslo nesedí." },
      { status: 500 }
    );
  }

  const origin = request.nextUrl.origin;
  return NextResponse.redirect(new URL("/dashboard", origin));
}
