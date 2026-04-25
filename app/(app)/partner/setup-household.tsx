"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { createHousehold } from "@/app/(app)/partner/actions";
import { toast } from "sonner";

export function SetupHousehold() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createHousehold(name.trim());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Domácnost vytvořena!");
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        {/* Decorative heart */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20">
              <Heart
                size={64}
                className="text-pink-400"
                fill="currentColor"
              />
            </div>
            <Heart
              size={64}
              className="text-pink-500 relative"
              fill="currentColor"
            />
          </div>
        </div>

        <div className="space-y-2 max-w-sm mx-auto">
          <h2 className="text-xl font-bold">
            Sdílej svůj život s partnerem
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Společné cíle, vzkazy, kalendář a nákupy. Protože společně to
            jde líp.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název domácnosti (např. Klimentovi)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Button
            onClick={handleCreate}
            disabled={isPending || !name.trim()}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isPending ? "Vytvářím..." : "Vytvořit domácnost"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
