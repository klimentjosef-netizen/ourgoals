import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getXPProgress } from "@/types/gamification";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Flame,
  Star,
  Calendar,
  Zap,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Lock,
} from "lucide-react";
import type {
  GamificationProfile,
  UserAchievement,
  Profile,
} from "@/types/database";
import type { Achievement } from "@/types/gamification";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all profile data in parallel
  const [gamRes, achievementsRes, allAchievementsRes, profileRes] =
    await Promise.all([
      supabase
        .from("gamification_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single(),
      supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("profile_id", user.id),
      supabase.from("achievements").select("*").order("category"),
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single(),
    ]);

  const gamification = gamRes.data as GamificationProfile | null;
  const userAchievements = (achievementsRes.data ?? []) as Array<
    UserAchievement & { achievements: Achievement }
  >;
  const allAchievements = (allAchievementsRes.data ?? []) as Achievement[];
  const profile = profileRes.data as Pick<
    Profile,
    "display_name" | "avatar_url"
  > | null;

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

  const totalXP = gamification?.total_xp ?? 0;
  const xp = getXPProgress(totalXP);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      {/* User info + Level */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {profile?.display_name
                ? profile.display_name.charAt(0).toUpperCase()
                : "?"}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                {profile?.display_name ?? "Uživatel"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Lv. {xp.currentLevel}</Badge>
                <span className="text-sm text-muted-foreground">
                  {xp.title}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{xp.currentXP} XP</span>
              <span>{xp.nextLevelXP} XP</span>
            </div>
            <Progress value={xp.percentage} />
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card size="sm">
          <CardContent className="pt-2 flex items-center gap-3">
            <Flame size={20} className="text-orange-500" />
            <div>
              <p className="text-xl font-bold tabular-nums">
                {gamification?.current_streak ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Aktuální streak
              </p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-2 flex items-center gap-3">
            <Star size={20} className="text-yellow-500" />
            <div>
              <p className="text-xl font-bold tabular-nums">
                {gamification?.longest_streak ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Nejdelší streak
              </p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-2 flex items-center gap-3">
            <Zap size={20} className="text-primary" />
            <div>
              <p className="text-xl font-bold tabular-nums">{totalXP}</p>
              <p className="text-[10px] text-muted-foreground">Celkem XP</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-2 flex items-center gap-3">
            <Calendar size={20} className="text-muted-foreground" />
            <div>
              <p className="text-xl font-bold tabular-nums">
                {(gamification?.perfect_days ?? 0) +
                  (gamification?.ok_days ?? 0) +
                  (gamification?.missed_days ?? 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Celkem dní
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Přehled dní</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 size={14} className="text-green-500" />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {gamification?.perfect_days ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Perfektní dny
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <MinusCircle size={14} className="text-yellow-500" />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {gamification?.ok_days ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">OK dny</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle size={14} className="text-red-500" />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {gamification?.missed_days ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Zmeškané dny
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy size={16} />
            Achievementy
            <Badge variant="secondary" className="ml-auto">
              {unlockedIds.size}/{allAchievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allAchievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Zatím nejsou definovány žádné achievementy.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {allAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors ${
                      isUnlocked
                        ? "bg-primary/5"
                        : "bg-muted/30 opacity-40"
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {isUnlocked ? (
                        achievement.icon || "🏆"
                      ) : (
                        <Lock
                          size={20}
                          className="text-muted-foreground"
                        />
                      )}
                    </div>
                    <p className="text-[10px] font-medium leading-tight">
                      {achievement.name}
                    </p>
                    {isUnlocked && achievement.xp_reward > 0 && (
                      <p className="text-[9px] text-primary mt-0.5">
                        +{achievement.xp_reward} XP
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
