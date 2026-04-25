"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Plus, Target } from "lucide-react";
import { GottmanScore } from "@/components/domain/partner/gottman-score";
import { SendNoteCards } from "@/components/domain/partner/send-note-cards";
import { NoteTimeline } from "@/components/domain/partner/note-timeline";
import { SharedListCard } from "@/components/domain/partner/shared-list-card";
import {
  addListItem,
  toggleListItem,
  deleteSharedList,
  createSharedList,
} from "@/app/(app)/partner/actions";
import { toast } from "sonner";
import Link from "next/link";

interface GottmanScoreData {
  ratio: number;
  gratitude: number;
  bother: number;
  request: number;
  celebrate: number;
  status: "good" | "warning" | "danger";
}

interface PartnerNote {
  id: string;
  kind: "gratitude" | "bother" | "request" | "celebrate";
  content: string;
  author_id: string;
  is_read: boolean;
  created_at: string;
  profiles?: { display_name: string } | null;
}

interface SharedList {
  id: string;
  name: string;
  kind: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}

interface PartnerDashboardProps {
  gottmanScore: GottmanScoreData;
  notes: PartnerNote[];
  sharedLists: SharedList[];
  currentUserId: string;
  householdId: string;
}

export function PartnerDashboard({
  gottmanScore,
  notes,
  sharedLists,
  currentUserId,
  householdId,
}: PartnerDashboardProps) {
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListKind, setNewListKind] = useState("shopping");
  const [isPending, startTransition] = useTransition();

  function handleCreateList() {
    if (!newListName.trim()) return;
    startTransition(async () => {
      const result = await createSharedList(newListName.trim(), newListKind);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Seznam vytvořen!");
      setNewListName("");
      setShowNewList(false);
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. Gottman Score — prominent */}
      <GottmanScore {...gottmanScore} />

      {/* 2. Send note cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <MessageCircle size={14} />
          Poslat vzkaz
        </h2>
        <SendNoteCards />
      </section>

      <Separator />

      {/* 3. Note timeline */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Vzkazy
        </h2>
        <NoteTimeline notes={notes} currentUserId={currentUserId} />
      </section>

      <Separator />

      {/* 4. Shared lists */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Sdílené seznamy
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewList(!showNewList)}
            className="text-xs"
          >
            <Plus size={14} />
            Nový seznam
          </Button>
        </div>

        {/* New list form */}
        {showNewList && (
          <Card size="sm">
            <CardContent className="pt-3 space-y-2">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Název seznamu..."
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateList();
                  }
                  if (e.key === "Escape") setShowNewList(false);
                }}
              />
              <div className="flex gap-1.5 flex-wrap">
                {(
                  [
                    ["shopping", "Nákupy"],
                    ["todo", "Úkoly"],
                    ["ideas", "Nápady"],
                    ["other", "Ostatní"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setNewListKind(value)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      newListKind === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleCreateList}
                  disabled={isPending || !newListName.trim()}
                  className="text-xs"
                >
                  Vytvořit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewList(false);
                    setNewListName("");
                  }}
                  className="text-xs"
                >
                  Zrušit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* List cards */}
        {sharedLists.length === 0 && !showNewList && (
          <Card size="sm">
            <CardContent className="py-6 text-center">
              <p className="text-xs text-muted-foreground">
                Zatím žádné sdílené seznamy. Vytvořte první!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {sharedLists.map((list) => (
            <SharedListCard
              key={list.id}
              list={list}
              onAddItem={addListItem}
              onToggleItem={toggleListItem}
              onDelete={deleteSharedList}
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* 5. Link to shared goals */}
      <section>
        <Link href="/goals?shared=true">
          <Card className="hover:border-pink-300 dark:hover:border-pink-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target size={16} className="text-pink-500" />
                Společné cíle
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-2">
              <p className="text-xs text-muted-foreground">
                Zobrazit cíle sdílené s partnerem &rarr;
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
