"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SliderField } from "@/components/domain/checkin/slider-field";
import { saveEveningCheckin } from "./actions";
import { toast } from "sonner";
import { MoonStar, Loader2 } from "lucide-react";

export function EveningForm() {
  const [isPending, startTransition] = useTransition();

  const [dayRating, setDayRating] = useState(5);
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(3);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveEveningCheckin(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.xpAwarded) {
        toast.success(`+${result.xpAwarded} XP za večerní check-in!`, {
          description:
            result.streak && result.streak > 1
              ? `Streak: ${result.streak} dní v řadě!`
              : "Dobrá práce!",
        });
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
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <MoonStar size={24} className="text-indigo-400" />
        <h2 className="text-xl font-bold">Večerní check-in</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hodnocení dne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SliderField
            name="day_rating"
            label="Známka dne"
            value={dayRating}
            onChange={setDayRating}
          />

          <SliderField
            name="mood"
            label="Nálada"
            value={mood}
            onChange={setMood}
          />

          <SliderField
            name="stress"
            label="Stres"
            value={stress}
            onChange={setStress}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reflexe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="best_thing">Co bylo dnes nejlepší?</Label>
            <Textarea
              id="best_thing"
              name="best_thing"
              placeholder="Nejlepší moment dne..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="worst_thing">Co bylo nejhorší?</Label>
            <Textarea
              id="worst_thing"
              name="worst_thing"
              placeholder="Co se nepovedlo..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tomorrow_risk">Největší riziko zítřka?</Label>
            <Textarea
              id="tomorrow_risk"
              name="tomorrow_risk"
              placeholder="Na co si dát pozor..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metriky</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="caffeine">Kofein</Label>
              <Input
                type="number"
                id="caffeine"
                name="caffeine"
                min={0}
                max={20}
                defaultValue={0}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">nápojů</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alcohol">Alkohol</Label>
              <Input
                type="number"
                id="alcohol"
                name="alcohol"
                min={0}
                max={20}
                defaultValue={0}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">nápojů</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="screen_time">Screen time</Label>
              <Input
                type="number"
                id="screen_time"
                name="screen_time"
                min={0}
                max={600}
                defaultValue={0}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Ukládám...
          </>
        ) : (
          "Uložit večerní check-in"
        )}
      </Button>
    </form>
  );
}
