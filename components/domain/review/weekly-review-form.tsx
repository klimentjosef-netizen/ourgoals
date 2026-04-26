"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PenLine, CheckCircle2 } from "lucide-react";
import { saveWeeklyReview } from "@/app/(app)/review/actions";
import { toast } from "sonner";

interface WeeklyReviewFormProps {
  weekStart: string;
  initialWins: string | null;
  initialStruggles: string | null;
  initialNextWeekFocus: string | null;
  isCompleted: boolean;
}

export function WeeklyReviewForm({
  weekStart,
  initialWins,
  initialStruggles,
  initialNextWeekFocus,
  isCompleted,
}: WeeklyReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [wins, setWins] = useState(initialWins ?? "");
  const [struggles, setStruggles] = useState(initialStruggles ?? "");
  const [nextWeekFocus, setNextWeekFocus] = useState(initialNextWeekFocus ?? "");
  const [saved, setSaved] = useState(isCompleted);

  function handleSubmit() {
    const fd = new FormData();
    fd.set("week_start", weekStart);
    fd.set("wins", wins);
    fd.set("struggles", struggles);
    fd.set("next_week_focus", nextWeekFocus);

    startTransition(async () => {
      const result = await saveWeeklyReview(fd);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`+${result.xpAwarded} XP za týdenní review!`, {
        description: "Skvělá reflexe!",
      });
      setSaved(true);
    });
  }

  if (saved && !wins && !struggles && !nextWeekFocus) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center space-y-3">
          <CheckCircle2 size={32} className="mx-auto text-green-500" />
          <p className="text-sm font-medium">Týdenní review uloženo!</p>
          <p className="text-xs text-muted-foreground">Můžeš ho kdykoliv doplnit.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <PenLine size={16} className="text-primary" />
          Tvoje reflexe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="wins" className="text-xs font-medium">
            Co se ti povedlo? (Výhry)
          </Label>
          <Textarea
            id="wins"
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            placeholder="Např. Dodržel jsem 4 tréninky, splnil protein cíl 5/7 dní..."
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="struggles" className="text-xs font-medium">
            S čím jsi bojoval? (Výzvy)
          </Label>
          <Textarea
            id="struggles"
            value={struggles}
            onChange={(e) => setStruggles(e.target.value)}
            placeholder="Např. Špatný spánek v pondělí, přeskočil deep work ve středu..."
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="focus" className="text-xs font-medium">
            Na co se zaměříš příští týden?
          </Label>
          <Textarea
            id="focus"
            value={nextWeekFocus}
            onChange={(e) => setNextWeekFocus(e.target.value)}
            placeholder="Např. Chodit spát do 22:30, dokončit report, meditace každý den..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full h-11"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          {saved ? "Aktualizovat review" : "Uložit review (+30 XP)"}
        </Button>
      </CardContent>
    </Card>
  );
}
