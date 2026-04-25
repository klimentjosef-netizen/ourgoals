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
import { Sun, Moon, Scale, Smile, Loader2 } from "lucide-react";
import { YesterdayComparison } from "@/components/domain/checkin/yesterday-comparison";

interface MorningFormProps {
  userId?: string;
}

export function MorningForm({ userId }: MorningFormProps) {
  const [isPending, startTransition] = useTransition();
  const [sleepQuality, setSleepQuality] = useState(5);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [skipWeight, setSkipWeight] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveMorningCheckin(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.xpAwarded) {
        toast.success(
          `+${result.xpAwarded} XP${result.streak && result.streak > 1 ? ` \u2022 Streak: ${result.streak} dn\u00ed` : ""}`,
          { description: "Skv\u011bl\u00fd start dne!" },
        );
      }
      if (result?.achievementsUnlocked?.length) {
        for (const a of result.achievementsUnlocked) {
          toast.success(`Achievement odem\u010den: ${a}`, {
            description: "Nov\u00fd achievement!",
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
            Sp\u00e1nek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedtime">Kdy jsi \u0161el sp\u00e1t</Label>
              <Input
                type="time"
                id="bedtime"
                name="bedtime"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wake_time">Kdy jsi vstal</Label>
              <Input
                type="time"
                id="wake_time"
                name="wake_time"
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <SliderField
              name="sleep_quality"
              label="Kvalita sp\u00e1nku"
              value={sleepQuality}
              onChange={setSleepQuality}
            />
            <div className="space-y-1.5 text-center">
              <Label htmlFor="wake_count">Probuzen\u00ed</Label>
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
        </CardContent>
      </Card>

      {/* ---- T\u011blo ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale size={18} className="text-emerald-500" />
            T\u011blo
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
              P\u0159esko\u010dit v\u00e1\u017een\u00ed
            </Label>
          </div>

          {!skipWeight && (
            <div className="space-y-1.5">
              <Label htmlFor="weight">V\u00e1ha (kg)</Label>
              <Input
                type="number"
                id="weight"
                name="weight"
                step={0.1}
                min={30}
                max={300}
                placeholder="Nepovinn\u00e9"
                className="h-11 w-36"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Jak se c\u00edt\u00ed\u0161? ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smile size={18} className="text-amber-500" />
            Jak se c\u00edt\u00ed\u0161?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SliderField
            name="mood"
            label="N\u00e1lada"
            value={mood}
            onChange={setMood}
          />

          <SliderField
            name="energy"
            label="Energie"
            value={energy}
            onChange={setEnergy}
          />

          <div className="space-y-1.5">
            <Label htmlFor="plan">Co dnes pl\u00e1nuje\u0161?</Label>
            <Textarea
              id="plan"
              name="plan"
              placeholder="Hlavn\u00ed pl\u00e1ny a priority na dne\u0161ek..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" />
            Ukl\u00e1d\u00e1m...
          </>
        ) : (
          "Ulo\u017eit rann\u00ed check-in"
        )}
      </Button>
    </form>
  );
}
