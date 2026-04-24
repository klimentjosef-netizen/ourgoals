"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddMeal } from "@/app/(app)/nutrition/add-meal";

interface NutritionClientProps {
  userId: string;
  date: string;
}

export function NutritionClient({
  userId,
  date,
}: NutritionClientProps) {
  const [showAddMeal, setShowAddMeal] = useState(false);

  return (
    <div>
      {showAddMeal ? (
        <AddMeal
          userId={userId}
          date={date}
          onClose={() => setShowAddMeal(false)}
        />
      ) : (
        <Button
          onClick={() => setShowAddMeal(true)}
          className="w-full"
          size="sm"
        >
          <Plus size={14} />
          Přidat jídlo
        </Button>
      )}
    </div>
  );
}
