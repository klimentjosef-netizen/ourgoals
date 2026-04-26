"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle, Plus, Target, Heart, Clock, CheckCircle2,
  Smile, Zap, TrendingUp, TrendingDown, Minus, ArrowRight,
  ListTodo, Trash2, Users, Flame, Trophy,
} from "lucide-react";
import { GottmanScore } from "@/components/domain/partner/gottman-score";
import { SendNoteCards } from "@/components/domain/partner/send-note-cards";
import { NoteTimeline } from "@/components/domain/partner/note-timeline";
import { SharedListCard } from "@/components/domain/partner/shared-list-card";
import {
  addListItem,
  toggleListItem,
  deleteSharedList,
  createSharedList,
  completeHouseholdTask,
  deleteHouseholdTask,
  logQualityTime,
  createSharedChallenge,
} from "@/app/(app)/partner/actions";
import type { HouseholdTask } from "@/app/(app)/partner/actions";
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

interface PartnerMood {
  name: string;
  mood: number | null;
  energy: number | null;
  hasCheckedIn: boolean;
}

interface RelationshipHealth {
  avgScore: number | null;
  trend: "up" | "down" | "same" | null;
  lastCheckin: string | null;
}

interface PartnerDashboardProps {
  gottmanScore: GottmanScoreData;
  notes: PartnerNote[];
  sharedLists: SharedList[];
  currentUserId: string;
  householdId: string;
  tasks: HouseholdTask[];
  qualityTimeMinutes: number;
  relationshipHealth: RelationshipHealth;
  challenges: unknown[];
  partnerMood: PartnerMood | null;
  partnerName: string;
}

export function PartnerDashboard({
  gottmanScore,
  notes,
  sharedLists,
  currentUserId,
  householdId,
  tasks,
  qualityTimeMinutes,
  relationshipHealth,
  partnerMood,
  partnerName,
}: PartnerDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListKind, setNewListKind] = useState("shopping");

  const todoTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const qualityTimeHours = Math.round(qualityTimeMinutes / 60 * 10) / 10;

  function handleCreateList() {
    if (!newListName.trim()) return;
    startTransition(async () => {
      const result = await createSharedList(newListName.trim(), newListKind);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Seznam vytvořen!");
      setNewListName("");
      setShowNewList(false);
    });
  }

  function handleCompleteTask(taskId: string) {
    startTransition(async () => {
      const result = await completeHouseholdTask(taskId);
      if (result.error) toast.error(result.error);
      else toast.success("Úkol splněn!");
    });
  }

  function handleDeleteTask(taskId: string) {
    startTransition(async () => {
      const result = await deleteHouseholdTask(taskId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Partner mood card — how is your partner doing */}
      {partnerMood && (
        <Card className="border-pink-200/50 dark:border-pink-800/30 bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Heart size={20} className="text-pink-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{partnerMood.name}</p>
                {partnerMood.hasCheckedIn ? (
                  <div className="flex items-center gap-3 mt-0.5">
                    {partnerMood.mood != null && (
                      <div className="flex items-center gap-1">
                        <Smile size={12} className="text-amber-500" />
                        <span className="text-xs font-mono">{partnerMood.mood}/10</span>
                      </div>
                    )}
                    {partnerMood.energy != null && (
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-green-500" />
                        <span className="text-xs font-mono">{partnerMood.energy}/10</span>
                      </div>
                    )}
                    {partnerMood.mood != null && partnerMood.mood < 4 && (
                      <Badge variant="outline" className="text-[10px] text-pink-600 border-pink-300">
                        Nemá nejlepší den
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Ještě neudělal/a ranní check-in</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Gottman mini */}
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Heart size={16} className={`mx-auto mb-1 ${
              gottmanScore.status === "good" ? "text-green-500" :
              gottmanScore.status === "warning" ? "text-amber-500" : "text-red-500"
            }`} />
            <p className="text-lg font-bold tabular-nums">{gottmanScore.ratio.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">Gottman</p>
          </CardContent>
        </Card>

        {/* Quality time */}
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Clock size={16} className="mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold tabular-nums">{qualityTimeHours}h</p>
            <p className="text-[10px] text-muted-foreground">Spolu</p>
          </CardContent>
        </Card>

        {/* Relationship health */}
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy size={16} className="text-primary" />
              {relationshipHealth.trend === "up" && <TrendingUp size={10} className="text-green-500" />}
              {relationshipHealth.trend === "down" && <TrendingDown size={10} className="text-red-500" />}
              {relationshipHealth.trend === "same" && <Minus size={10} className="text-muted-foreground" />}
            </div>
            <p className="text-lg font-bold tabular-nums">
              {relationshipHealth.avgScore ?? "–"}
            </p>
            <p className="text-[10px] text-muted-foreground">Zdraví</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Gottman detail */}
      <GottmanScore {...gottmanScore} />

      {/* 4. Send note */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <MessageCircle size={14} />
          Poslat vzkaz
        </h2>
        <SendNoteCards />
      </section>

      <Separator />

      {/* 5. Household tasks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <ListTodo size={14} />
            Společné úkoly
          </h2>
          <Link href="/partner/tasks">
            <Button variant="ghost" size="sm" className="text-xs">
              Všechny <ArrowRight size={12} />
            </Button>
          </Link>
        </div>

        {todoTasks.length > 0 ? (
          <div className="space-y-1.5">
            {todoTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={isPending}
                  className="shrink-0"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 hover:border-green-500 transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.assigned_to && (
                      <span className="text-[10px] text-muted-foreground">
                        {task.assigned_to === currentUserId ? "Ty" : partnerName}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(task.due_date + "T00:00:00").toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => handleDeleteTask(task.id)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground">Žádné úkoly. Přidejte první!</p>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* 6. Note timeline */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Vzkazy</h2>
        <NoteTimeline notes={notes} currentUserId={currentUserId} />
      </section>

      <Separator />

      {/* 7. Shared lists */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Sdílené seznamy</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowNewList(!showNewList)} className="text-xs">
            <Plus size={14} /> Nový
          </Button>
        </div>

        {showNewList && (
          <Card>
            <CardContent className="pt-3 space-y-2">
              <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Název seznamu..." className="h-10" autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateList(); } }} />
              <div className="flex gap-1.5 flex-wrap">
                {([["shopping", "Nákupy"], ["todo", "Úkoly"], ["ideas", "Nápady"]] as const).map(([value, label]) => (
                  <button key={value} onClick={() => setNewListKind(value)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${newListKind === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateList} disabled={isPending || !newListName.trim()}>Vytvořit</Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowNewList(false); setNewListName(""); }}>Zrušit</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {sharedLists.length === 0 && !showNewList && (
          <Card><CardContent className="py-4 text-center"><p className="text-xs text-muted-foreground">Zatím žádné sdílené seznamy.</p></CardContent></Card>
        )}

        <div className="space-y-3">
          {sharedLists.map((list) => (
            <SharedListCard key={list.id} list={list} onAddItem={addListItem} onToggleItem={toggleListItem} onDelete={deleteSharedList} />
          ))}
        </div>
      </section>

      <Separator />

      {/* 8. Shared goals link */}
      <section>
        <Link href="/goals?shared=true">
          <Card className="hover:border-pink-300 dark:hover:border-pink-800 transition-colors">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Target size={20} className="text-pink-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Společné cíle</p>
                <p className="text-xs text-muted-foreground">Zobrazit cíle sdílené s partnerem</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
