import { getAuthUser } from "@/lib/auth";
import { getTrainingPlans } from "../../actions";
import { createPlanFromTemplate, createPlan } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { PLAN_TEMPLATES } from "../templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, LayoutTemplate, PenLine, CalendarDays } from "lucide-react";
import Link from "next/link";
import { PlanEditor } from "@/components/domain/training/plan-editor";
import { redirect } from "next/navigation";

export default async function PlanEditPage() {
  const user = await getAuthUser();
  const plans = await getTrainingPlans(user.id);

  // If plan exists, load workouts for the editor
  if (plans.length > 0) {
    let workouts: Record<string, unknown>[] = [];
    if (!DEV_MODE) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("workouts")
        .select("*, workout_exercises(*, exercises(*))")
        .eq("plan_id", plans[0].id)
        .order("day_index");
      workouts = data ?? [];
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/training/plan" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Upravit plán</h1>
        </div>

        <PlanEditor
          planId={plans[0].id}
          planName={plans[0].name}
          workouts={workouts as never}
        />
      </div>
    );
  }

  // No plan — show template selection + custom option
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/training" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Nový plán</h1>
      </div>

      {/* Templates */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutTemplate size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Šablony
          </h2>
        </div>

        <div className="grid gap-3">
          {PLAN_TEMPLATES.map((template) => (
            <form key={template.id} action={async () => {
              "use server";
              await createPlanFromTemplate(template.id);
              redirect("/training/plan/edit");
            }}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{template.name}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {template.daysPerWeek}×/týden
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {template.days.map((d) => (
                          <Badge key={d.dayIndex} variant="outline" className="text-[10px]">
                            {d.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" size="sm">
                      Použít
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          ))}
        </div>
      </div>

      {/* Custom plan */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PenLine size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Vlastní plán
          </h2>
        </div>

        <Card>
          <CardContent className="pt-4 pb-4">
            <form action={async (formData: FormData) => {
              "use server";
              await createPlan(formData);
              redirect("/training/plan/edit");
            }} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Název plánu</label>
                <Input
                  name="name"
                  placeholder="např. Můj plán"
                  required
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Dnů/týden</label>
                  <Input
                    name="days_per_week"
                    type="number"
                    placeholder="4"
                    min={1}
                    max={7}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Typ splitu</label>
                  <Input
                    name="split_type"
                    placeholder="např. upper_lower"
                    className="h-11"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <PenLine size={14} />
                Vytvořit prázdný plán
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
