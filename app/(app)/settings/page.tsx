import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Layers, MessageCircle, Palette, Target, Download, Trash2 } from "lucide-react";
import type { ModuleId } from "@/types/modules";
import { ThemePicker } from "@/components/domain/settings/theme-picker";
import { ProfileForm } from "@/components/domain/settings/profile-form";
import { ModuleToggle } from "@/components/domain/settings/module-toggle";
import { TargetsForm } from "@/components/domain/settings/targets-form";
import { CoachToneSelector } from "@/components/domain/settings/coach-tone-selector";
import { DataSection } from "@/components/domain/settings/data-section";

export default async function SettingsPage() {
  const user = await getAuthUser();

  let activeModules: ModuleId[] = [];
  let coachTone = "friendly_mentor";
  let displayName = "";
  let dateOfBirth: string | null = null;
  let tdeeOverride: number | null = null;
  let proteinG: number | null = null;
  let carbsG: number | null = null;
  let fatG: number | null = null;
  let bedtimeTarget: string | null = null;
  let wakeTarget: string | null = null;
  let workDays: number[] = [1, 2, 3, 4, 5];

  if (!DEV_MODE) {
    const supabase = await createClient();

    const [{ data: settingsData }, { data: profileData }] = await Promise.all([
      supabase
        .from("user_settings")
        .select("active_modules, coach_tone, tdee_override, protein_g, carbs_g, fat_g, bedtime_target, wake_target, work_days")
        .eq("profile_id", user.id)
        .single(),
      supabase
        .from("profiles")
        .select("display_name, date_of_birth")
        .eq("id", user.id)
        .single(),
    ]);

    activeModules = (settingsData?.active_modules ?? []) as ModuleId[];
    coachTone = settingsData?.coach_tone ?? "friendly_mentor";
    tdeeOverride = settingsData?.tdee_override ?? null;
    proteinG = settingsData?.protein_g ?? null;
    carbsG = settingsData?.carbs_g ?? null;
    fatG = settingsData?.fat_g ?? null;
    bedtimeTarget = settingsData?.bedtime_target ?? null;
    wakeTarget = settingsData?.wake_target ?? null;
    workDays = (settingsData?.work_days as number[]) ?? [1, 2, 3, 4, 5];

    displayName = profileData?.display_name ?? "";
    dateOfBirth = profileData?.date_of_birth ?? null;
  } else {
    activeModules = ["goals_habits", "sleep_wellbeing", "calendar", "work_focus", "training", "nutrition"];
    displayName = "Dev User";
    dateOfBirth = "1990-01-15";
    tdeeOverride = 2400;
    proteinG = 160;
    carbsG = 250;
    fatG = 80;
    bedtimeTarget = "22:30";
    wakeTarget = "06:00";
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings size={24} className="text-primary" />
        <h1 className="text-xl font-bold">Nastavení</h1>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={16} />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {user.email}
          </p>
          <ProfileForm displayName={displayName} dateOfBirth={dateOfBirth} />
        </CardContent>
      </Card>

      {/* Moduly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers size={16} />
            Aktivní moduly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleToggle activeModules={activeModules} />
        </CardContent>
      </Card>

      {/* Coach tón */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle size={16} />
            Tón kouče
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoachToneSelector currentTone={coachTone} />
        </CardContent>
      </Card>

      {/* Barevné schéma */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette size={16} />
            Barevné schéma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemePicker />
        </CardContent>
      </Card>

      {/* Cíle & limity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target size={16} />
            Cíle & limity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TargetsForm
            tdeeOverride={tdeeOverride}
            proteinG={proteinG}
            carbsG={carbsG}
            fatG={fatG}
            bedtimeTarget={bedtimeTarget}
            wakeTarget={wakeTarget}
            workDays={workDays}
          />
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download size={16} />
            Data & účet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataSection userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
