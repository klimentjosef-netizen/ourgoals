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
import { Separator } from "@/components/ui/separator";
import { SliderField } from "@/components/domain/checkin/slider-field";
import { saveMorningCheckin } from "./actions";
import { toast } from "sonner";
import { Sun, Moon, Loader2 } from "lucide-react";

export function MorningForm() {
  const [isPending, startTransition] = useTransition();

  const [sleepQuality, setSleepQuality] = useState(5);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveMorningCheckin(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.xpAwarded) {
        toast.success(`+${result.xpAwarded} XP za ranní check-in!`, {
          description: "Skvělý start dne!",
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
        <Sun size={24} className="text-yellow-500" />
        <h2 className="text-xl font-bold">Ranní check-in</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon size={16} />
            Spánek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedtime">Kdy jsi šel spát</Label>
              <Input type="time" id="bedtime" name="bedtime" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wake_time">Kdy jsi vstal</Label>
              <Input type="time" id="wake_time" name="wake_time" />
            </div>
          </div>

          <SliderField
            name="sleep_quality"
            label="Kvalita spánku"
            value={sleepQuality}
            onChange={setSleepQuality}
          />

          <div className="space-y-1.5">
            <Label htmlFor="wake_count">Kolikrát ses probudil</Label>
            <Input
              type="number"
              id="wake_count"
              name="wake_count"
              min={0}
              max={20}
              defaultValue={0}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jak se cítíš</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              className="w-32"
            />
          </div>

          <SliderField
            name="mood"
            label="Jak se cítíš?"
            value={mood}
            onChange={setMood}
          />

          <SliderField
            name="energy"
            label="Energie"
            value={energy}
            onChange={setEnergy}
          />
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <Label htmlFor="plan">Co dnes plánuješ?</Label>
        <Textarea
          id="plan"
          name="plan"
          placeholder="Hlavní plány a priority na dnešek..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Ukládám...
          </>
        ) : (
          "Uložit ranní check-in"
        )}
      </Button>
    </form>
  );
}
