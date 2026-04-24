"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { logBodyMetric } from "@/app/(app)/body/actions";

export function BodyMetricForm() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await logBodyMetric(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Měření uloženo! +${result.xpAwarded} XP`);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm">
          <Plus size={14} />
          Nové měření
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nové měření</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="date" value={new Date().toISOString().split("T")[0]} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Váha (kg)</Label>
              <Input name="weight_kg" type="number" step="0.1" placeholder="92.3" />
            </div>
            <div>
              <Label className="text-xs">Body fat (%)</Label>
              <Input name="body_fat_pct" type="number" step="0.1" placeholder="18" />
            </div>
            <div>
              <Label className="text-xs">Pas (cm)</Label>
              <Input name="waist_cm" type="number" step="0.1" />
            </div>
            <div>
              <Label className="text-xs">Hrudník (cm)</Label>
              <Input name="chest_cm" type="number" step="0.1" />
            </div>
            <div>
              <Label className="text-xs">Boky (cm)</Label>
              <Input name="hip_cm" type="number" step="0.1" />
            </div>
            <div>
              <Label className="text-xs">Stehno (cm)</Label>
              <Input name="thigh_cm" type="number" step="0.1" />
            </div>
            <div>
              <Label className="text-xs">Paže (cm)</Label>
              <Input name="arm_cm" type="number" step="0.1" />
            </div>
          </div>
          <Button type="submit" className="w-full">Uložit měření</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
