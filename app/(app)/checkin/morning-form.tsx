"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SliderField } from "@/components/domain/checkin/slider-field";
import { saveMorningCheckin } from "./actions";
import { toast } from "sonner";
import { Sun, Moon, Scale, Smile, Loader2, AlertCircle } from "lucide-react";
import { YesterdayComparison } from "@/components/domain/checkin/yesterday-comparison";
import type { TrackingPrefs } from "./page";

interface MorningFormProps {
  userId?: string;
  trackingPrefs?: TrackingPrefs;
}

export function MorningForm({ userId, trackingPrefs }: MorningFormProps) {
  const [isPending, startTransition] = useTransition();
  const [sleepQuality, setSleepQuality] = useState(5);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [skipWeight, setSkipWeight] = useState(false);
  const [sleepFactors, setSleepFactors] = useState<string[]>([]);
  const [sleepNotes, setSleepNotes] = useState("");

  const showMood = trackingPrefs?.trackMood ?? true;
  const showEnergy = trackingPrefs?.trackEnergy ?? true;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveMorningCheckin(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.xpAwarded) {
        toast.success(
          `+${result.xpAwarded} XP${result.streak && result.streak > 1 ? ` • Streak: ${result.streak} dní` : ""}`,
          { description: "Skvělý start dne!" },
        );
      }
      if (result?.achievementsUnlocked?.length) {
        for (const a of result.achievementsUnlocked) {
          toast.success(`Achievement odemčen: ${a}`, {
            description: "Nový achievement!",
          });
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Sun size={24} className="text-yellow-500" />
        <h2 className="text-xl font-bold">Ranní check-in</h2>
      </div>

      {userId && <YesterdayComparison userId={userId} variant="morning" />}

      {/* ---- Spánek ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon size={18} className="text-indigo-400" />
            Spánek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedtime">Kdy jsi šel spát</Label>
              <Input
                type="time"
                id="bedtime"
                name="bedtime"
                defaultValue={trackingPrefs?.bedtimeTarget ?? undefined}
                className="h-11"
              />
              {trackingPrefs?.bedtimeTarget && (
                <p className="text-[10px] text-muted-foreground">
                  Cíl: {trackingPrefs.bedtimeTarget}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wake_time">Kdy jsi vstal</Label>
              <Input
                type="time"
                id="wake_time"
                name="wake_time"
                defaultValue={trackingPrefs?.wakeTarget ?? undefined}
                className="h-11"
              />
              {trackingPrefs?.wakeTarget && (
                <p className="text-[10px] text-muted-foreground">
                  Cíl: {trackingPrefs.wakeTarget}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <SliderField
              name="sleep_quality"
              label="Kvalita spánku"
              value={sleepQuality}
              onChange={setSleepQuality}
            />
            <div className="space-y-1.5 text-center">
              <Label htmlFor="wake_count">Probuzení</Label>
              <Input
                type="number"
                id="wake_count"
                name="wake_count"
                min={0}
                max={20}
                defaultValue={0}
                className="h-11 w-20 text-center"
              />
            </div>
          </div>

          {/* Sleep quality notes — show when quality <= 5 */}
          {sleepQuality <= 5 && (
            <div className="space-y-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                <Label className="text-xs font-medium">Co ovlivnilo spánek?</Label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "stress", label: "Stres" },
                  { id: "caffeine", label: "Kofein" },
                  { id: "screen", label: "Obrazovka" },
                  { id: "noise", label: "Hluk" },
                  { id: "temperature", label: "Teplota" },
                  { id: "pain", label: "Bolest" },
                  { id: "illness", label: "Nemoc" },
                  { id: "child", label: "Dítě" },
                  { id: "nightmare", label: "Noční můry" },
                  { id: "late_meal", label: "Pozdní jídlo" },
                ].map((factor) => {
                  const isSelected = sleepFactors.includes(factor.id);
                  return (
                    <button
                      key={factor.id}
                      type="button"
                      onClick={() => {
                        setSleepFactors((prev) =>
                          isSelected ? prev.filter((f) => f !== factor.id) : [...prev, factor.id]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                          : "bg-muted text-muted-foreground border-border hover:border-amber-300"
                      }`}
                    >
                      {factor.label}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="sleep_factors" value={sleepFactors.join(",")} />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Poznámka (volitelné)</Label>
                <Input
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  name="sleep_notes"
                  placeholder="Proč noc stála za nic..."
                  className="h-10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Tělo ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale size={18} className="text-emerald-500" />
            Tělo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="skip_weight"
              checked={skipWeight}
              onCheckedChange={(v) => setSkipWeight(v === true)}
            />
            <Label htmlFor="skip_weight" className="text-sm text-muted-foreground cursor-pointer">
              Přeskočit vážení
            </Label>
          </div>

          {!skipWeight && (
            <div className="space-y-1.5">
              <Label htmlFor="weight">Váha (kg)</Label>
              <Input
                type="number"
                id="weight"
                name="weight"
                step={0.1}
                min={30}
                max={300}
                placeholder="Nepovinné"
                className="h-11 w-36"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Jak se cítíš? (podmíněně podle preferencí) ---- */}
      {(showMood || showEnergy) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smile size={18} className="text-amber-500" />
              Jak se cítíš?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showMood && (
              <SliderField
                name="mood"
                label="Nálada"
                value={mood}
                onChange={setMood}
              />
            )}

            {showEnergy && (
              <SliderField
                name="energy"
                label="Energie"
                value={energy}
                onChange={setEnergy}
              />
            )}

            <div className="space-y-1.5">
              <Label htmlFor="plan">Co dnes plánuješ?</Label>
              <Textarea
                id="plan"
                name="plan"
                placeholder="Hlavní plány a priority na dnešek..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* If no mood/energy tracked, still show plan */}
      {!showMood && !showEnergy && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Plán dne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="plan">Co dnes plánuješ?</Label>
              <Textarea
                id="plan"
                name="plan"
                placeholder="Hlavní plány a priority na dnešek..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" />
            Ukládám...
          </>
        ) : (
          "Uložit ranní check-in"
        )}
      </Button>
    </form>
  );
}
