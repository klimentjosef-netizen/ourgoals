"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, CalendarDays, MessageCircle, Target, ShoppingCart, Loader2 } from "lucide-react";
import { createHousehold } from "@/app/(app)/partner/actions";
import { toast } from "sonner";

export function SetupHousehold() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createHousehold(name.trim());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Domácnost vytvořena!");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Decorative heart */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-20">
                <Heart size={64} className="text-pink-400" fill="currentColor" />
              </div>
              <Heart size={64} className="text-pink-500 relative" fill="currentColor" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="text-xl font-bold">
              Sdílej svůj život s partnerem
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vytvořte si společný prostor pro cíle, úkoly, kalendář a vzájemnou podporu. Protože společně to jde líp.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název domácnosti (např. Klimentovi)"
              className="h-12 text-center"
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
              className="h-12 bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Vytvářím...
                </>
              ) : (
                <>
                  <Heart size={16} className="mr-2" />
                  Vytvořit domácnost
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature preview */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2 text-center">
            <MessageCircle size={20} className="text-pink-500" />
            <p className="text-xs font-medium">Vzkazy</p>
            <p className="text-[10px] text-muted-foreground">Vděčnost, přání, podpora</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2 text-center">
            <Target size={20} className="text-green-500" />
            <p className="text-xs font-medium">Společné cíle</p>
            <p className="text-[10px] text-muted-foreground">Pokrok spolu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2 text-center">
            <CalendarDays size={20} className="text-blue-500" />
            <p className="text-xs font-medium">Sdílený kalendář</p>
            <p className="text-[10px] text-muted-foreground">Kdo kdy co</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2 text-center">
            <ShoppingCart size={20} className="text-amber-500" />
            <p className="text-xs font-medium">Úkoly a nákupy</p>
            <p className="text-[10px] text-muted-foreground">Sdílené seznamy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
