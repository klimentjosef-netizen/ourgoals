import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Target, Moon, Dumbbell, UtensilsCrossed, CalendarDays, Briefcase, Users } from "lucide-react";
import { MODULE_REGISTRY } from "@/types/modules";
import type { ModuleId } from "@/types/modules";

export default async function SettingsPage() {
  const user = await getAuthUser();

  let activeModules: ModuleId[] = [];
  let coachTone = "friendly_mentor";

  if (!DEV_MODE) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_settings")
      .select("active_modules, coach_tone")
      .eq("profile_id", user.id)
      .single();
    activeModules = (data?.active_modules ?? []) as ModuleId[];
    coachTone = data?.coach_tone ?? "friendly_mentor";
  } else {
    activeModules = ["goals_habits", "sleep_wellbeing", "calendar", "work_focus", "training", "nutrition"];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={24} className="text-primary" />
        <h1 className="text-xl font-bold">Nastavení</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={16} />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          <p><span className="text-muted-foreground">Coach tón:</span> <Badge variant="outline" className="text-xs">{coachTone}</Badge></p>
        </CardContent>
      </Card>

      {/* Active modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktivní moduly</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {MODULE_REGISTRY.map((mod) => {
              const isActive = activeModules.includes(mod.id);
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                    isActive ? "bg-primary/10 text-foreground" : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Icon size={14} />
                  <span>{mod.label}</span>
                  {isActive && <Badge variant="default" className="ml-auto text-[8px]">ON</Badge>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Editace modulů bude v další verzi. Zatím nastav přes onboarding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
