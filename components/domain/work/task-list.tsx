"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, Trash2, ArrowRight, Loader2, Circle, Clock, AlertTriangle } from "lucide-react";
import { createWorkTask, updateTaskStatus, deleteWorkTask } from "@/app/(app)/work/actions";
import { toast } from "sonner";
import type { WorkTask } from "@/app/(app)/work/actions";

interface TaskListProps {
  todoTasks: WorkTask[];
  inProgressTasks: WorkTask[];
  doneTasks: WorkTask[];
}

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Kritický", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
  2: { label: "Vysoký", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  3: { label: "Střední", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  4: { label: "Nízký", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  5: { label: "Někdy", color: "bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-500" },
};

function TaskItem({
  task,
  onStatusChange,
  onDelete,
}: {
  task: WorkTask;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = task.due_date && task.status !== "done" && task.due_date < new Date().toISOString().split("T")[0];
  const priority = PRIORITY_LABELS[task.priority] ?? PRIORITY_LABELS[3];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
      task.status === "done" ? "bg-muted/20 opacity-60" : isOverdue ? "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10" : "border-border"
    }`}>
      {/* Status button */}
      <button
        type="button"
        onClick={() => {
          if (task.status === "todo") onStatusChange(task.id, "in_progress");
          else if (task.status === "in_progress") onStatusChange(task.id, "done");
        }}
        className="mt-0.5 shrink-0"
        disabled={task.status === "done"}
      >
        {task.status === "done" ? (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={12} className="text-white" />
          </div>
        ) : task.status === "in_progress" ? (
          <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
            <ArrowRight size={10} className="text-primary" />
          </div>
        ) : (
          <Circle size={20} className="text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priority.color}`}>
            {priority.label}
          </span>
          {task.project && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {task.project}
            </span>
          )}
          {task.due_date && (
            <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`}>
              {isOverdue && <AlertTriangle size={8} />}
              <Clock size={8} />
              {new Date(task.due_date + "T00:00:00").toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })}
            </span>
          )}
          {task.estimated_minutes && (
            <span className="text-[10px] text-muted-foreground">
              ~{task.estimated_minutes} min
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      {task.status !== "done" && (
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export function TaskList({ todoTasks, inProgressTasks, doneTasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("3");
  const [newDueDate, setNewDueDate] = useState("");
  const [newProject, setNewProject] = useState("");
  const [showDone, setShowDone] = useState(false);

  function handleStatusChange(taskId: string, status: string) {
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, status);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.xpAwarded) {
        toast.success(`+${result.xpAwarded} XP za dokončený úkol!`);
      }
    });
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      const result = await deleteWorkTask(taskId);
      if (result.error) toast.error(result.error);
    });
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.set("title", newTitle.trim());
    fd.set("priority", newPriority);
    if (newDueDate) fd.set("due_date", newDueDate);
    if (newProject) fd.set("project", newProject);

    startTransition(async () => {
      const result = await createWorkTask(fd);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNewTitle("");
      setNewDueDate("");
      setNewProject("");
      setShowAdd(false);
    });
  }

  const allActive = [...inProgressTasks, ...todoTasks];

  return (
    <div className="space-y-3">
      {/* Active tasks */}
      {allActive.length > 0 ? (
        <div className="space-y-2">
          {inProgressTasks.map((t) => (
            <TaskItem key={t.id} task={t} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
          {todoTasks.map((t) => (
            <TaskItem key={t.id} task={t} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-sm text-muted-foreground">Žádné aktivní úkoly</p>
          </CardContent>
        </Card>
      )}

      {/* Add form */}
      {showAdd ? (
        <Card className="border-primary/30">
          <CardContent className="pt-4 pb-4 space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Název úkolu..."
              className="h-11"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <div className="grid grid-cols-3 gap-2">
              <Select value={newPriority} onValueChange={(v) => { if (v) setNewPriority(v); }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Priorita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Kritický</SelectItem>
                  <SelectItem value="2">Vysoký</SelectItem>
                  <SelectItem value="3">Střední</SelectItem>
                  <SelectItem value="4">Nízký</SelectItem>
                  <SelectItem value="5">Někdy</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="h-10"
                placeholder="Termín"
              />
              <Input
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="h-10"
                placeholder="Projekt"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-9"
                onClick={handleAdd}
                disabled={isPending || !newTitle.trim()}
              >
                {isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Přidat
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9"
                onClick={() => { setShowAdd(false); setNewTitle(""); }}
              >
                Zrušit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-11 w-full"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={16} className="mr-1.5" />
          Přidat úkol
        </Button>
      )}

      {/* Done tasks (collapsed) */}
      {doneTasks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowDone(!showDone)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDone ? "Skrýt" : "Zobrazit"} dokončené ({doneTasks.length})
          </button>
          {showDone && (
            <div className="space-y-1.5 mt-2">
              {doneTasks.slice(0, 10).map((t) => (
                <TaskItem key={t.id} task={t} onStatusChange={handleStatusChange} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
