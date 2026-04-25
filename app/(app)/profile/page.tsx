import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { getXPProgress } from "@/types/gamification";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Flame,
  Star,
  Calendar,
  Zap,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { EditableName, AchievementGrid } from "@/app/(app)/profile/profile-client";
import { ActivityHeatmap } from "@/components/domain/profile/activity-heatmap";
import { getProfileStats } from "@/app/(app)/profile/profile-actions";
import type {
  GamificationProfile,
  UserAchievement,
  Profile,
} from "@/types/database";
import type { Achievement } from "@/types/gamification";

export default async function ProfilePage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  // Fetch all profile data in parallel
  const [gamRes, achievementsRes, allAchievementsRes, profileRes, stats] =
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
      getProfileStats(user.id),
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
  const unlockedMap: Record<string, string> = {};
  for (const ua of userAchievements) {
    unlockedMap[ua.achievement_id] = ua.unlocked_at;
  }

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
              <EditableName initialName={profile?.display_name ?? "Uživatel"} />
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

      {/* Statistiky */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 size={16} />
            Statistiky
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Dumbbell size={16} className="text-blue-500" />
              </div>
              <p className="text-xl font-bold tabular-nums">{stats.totalWorkouts}</p>
              <p className="text-[10px] text-muted-foreground">Celkem tréninků</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <UtensilsCrossed size={16} className="text-green-500" />
              </div>
              <p className="text-xl font-bold tabular-nums">{stats.totalMeals}</p>
              <p className="text-[10px] text-muted-foreground">Zalogovaných jídel</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <ClipboardCheck size={16} className="text-purple-500" />
              </div>
              <p className="text-xl font-bold tabular-nums">{stats.totalCheckins}</p>
              <p className="text-[10px] text-muted-foreground">Celkem check-inů</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Zap size={16} className="text-yellow-500" />
              </div>
              <p className="text-xl font-bold tabular-nums">{stats.totalXP}</p>
              <p className="text-[10px] text-muted-foreground">Celkem XP</p>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold tabular-nums">{stats.avgAdherence}%</p>
              <p className="text-[10px] text-muted-foreground">Průměrná adherence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <ActivityHeatmap userId={user.id} />

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
          <AchievementGrid
            allAchievements={allAchievements}
            unlockedMap={unlockedMap}
            userId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
