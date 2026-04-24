"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AddMealForm } from "@/app/(app)/nutrition/add-meal";

interface NutritionClientProps {
  userId: string;
  date: string;
}

export function NutritionClient({ userId, date }: NutritionClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <AddMealForm userId={userId} date={date} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
