"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardCopy, CalendarPlus, Loader2, Plus } from "lucide-react";
import { copyYesterdayMeals } from "@/app/(app)/nutrition/actions";
import { AddMealForm } from "@/app/(app)/nutrition/add-meal";
import { toast } from "sonner";

interface NutritionActionsBarProps {
  userId: string;
  date: string;
  tomorrowDate: string;
}

export function NutritionActionsBar({ userId, date, tomorrowDate }: NutritionActionsBarProps) {
  const [isPending, startTransition] = useTransition();
  const [planOpen, setPlanOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  function handleCopyYesterday() {
    startTransition(async () => {
      const result = await copyYesterdayMeals(date);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Včerejší jídla zkopírována! (${result.count} jídel)`);
      }
    });
  }

  return (
    <div className="space-y-2">
      {/* Main add meal button */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogTrigger>
          <Button className="w-full h-11">
            <Plus size={16} />
            Přidat jídlo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Přidat jídlo</DialogTitle>
          </DialogHeader>
          <AddMealForm userId={userId} date={date} onDone={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex gap-2">
        {/* Copy yesterday (Feature 10) */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs"
          onClick={handleCopyYesterday}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ClipboardCopy size={14} />
          )}
          Kopírovat včerejšek
        </Button>

        {/* Plan for tomorrow (Feature 7) */}
        <Dialog open={planOpen} onOpenChange={setPlanOpen}>
          <DialogTrigger>
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
              <CalendarPlus size={14} />
              Naplánovat na zítra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Naplánovat jídlo na zítra</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mb-2">
              Datum: {tomorrowDate}
            </p>
            <AddMealForm
              userId={userId}
              date={tomorrowDate}
              onDone={() => setPlanOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
