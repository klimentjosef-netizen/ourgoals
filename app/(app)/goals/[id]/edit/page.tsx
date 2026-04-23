import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoalForm } from "@/components/domain/goals/goal-form";
import type { Goal } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGoalPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: goal, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (error || !goal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/goals/${id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Upravit cíl</h1>
      </div>

      <GoalForm goal={goal as Goal} />
    </div>
  );
}
