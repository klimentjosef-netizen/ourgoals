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
import { MoonStar, Star, Brain, Coffee, Loader2, Plus, Minus, Heart } from "lucide-react";
import Link from "next/link";
import { YesterdayComparison } from "@/components/domain/checkin/yesterday-comparison";

/* ---- Tap counter ---- */
function TapCounter({
  name,
  label,
  icon,
}: {
  name: string;
  label: string;
  icon: React.ReactNode;
}) {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          className="h-9 w-9 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label={`Snížit ${label}`}
        >
          <Minus size={16} />
        </button>

        <span className="text-2xl font-bold tabular-nums w-8 text-center">
          {count}
        </span>

        <button
          type="button"
          onClick={() => setCount((c) => Math.min(20, c + 1))}
          className="h-9 w-9 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label={`Zvýšit ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
        {icon}
        nápojů
      </div>
      <input type="hidden" name={name} value={count} />
    </div>
  );
}

interface EveningFormProps {
  hasHousehold?: boolean;
  userId?: string;
}

export function EveningForm({ hasHousehold = false, userId }: EveningFormProps) {
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
        toast.success(
          `+${result.xpAwarded} XP za večerní check-in!`,
          {
            description:
              result.streak && result.streak > 1
                ? `Streak: ${result.streak} dní v řadě!`
                : "Dobrá práce!",
          },
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
        <MoonStar size={24} className="text-indigo-400" />
        <h2 className="text-xl font-bold">Večerní check-in</h2>
      </div>

      {userId && <YesterdayComparison userId={userId} variant="evening" />}

      {/* ---- Hodnocení dne ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star size={18} className="text-yellow-500" />
            Hodnocení dne
          </CardTitle>
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

      {/* ---- Reflexe ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain size={18} className="text-purple-500" />
            Reflexe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="best_thing">Co bylo dnes nejlepší?</Label>
            <Textarea
              id="best_thing"
              name="best_thing"
              placeholder="Např. Skvělý trénink, produktivní meeting..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="worst_thing">Co bylo nejhorší?</Label>
            <Textarea
              id="worst_thing"
              name="worst_thing"
              placeholder="Co se nepovedlo nebo tě mrzelo..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tomorrow_risk">Největší riziko zítřka?</Label>
            <Textarea
              id="tomorrow_risk"
              name="tomorrow_risk"
              placeholder="Na co si dát pozor, co může pokazit zítřek..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Sledování ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coffee size={18} className="text-amber-600" />
            Sledování
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <TapCounter
              name="caffeine"
              label="Kofein"
              icon={<Coffee size={10} />}
            />
            <TapCounter
              name="alcohol"
              label="Alkohol"
              icon={<span className="text-[10px]">\ud83c\udf77</span>}
            />
            <div className="flex flex-col items-center gap-1.5">
              <Label htmlFor="screen_time" className="text-sm">
                Screen time
              </Label>
              <Input
                type="number"
                id="screen_time"
                name="screen_time"
                min={0}
                max={600}
                defaultValue={0}
                className="h-11 w-20 text-center"
              />
              <p className="text-[10px] text-muted-foreground">minut</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Vzkaz partnerovi ---- */}
      {hasHousehold && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-pink-500" />
              <span className="text-sm font-medium">
                Chceš partnerovi něco říct?
              </span>
            </div>
            <Link href="/partner">
              <Button variant="outline" size="sm" className="w-full">
                Přejít na Partner &rarr;
              </Button>
            </Link>
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
          "Uložit večerní check-in"
        )}
      </Button>
    </form>
  );
}
