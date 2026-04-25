"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ListItem {
  text: string;
  checked: boolean;
  addedBy: string;
  addedAt: string;
}

interface SharedList {
  id: string;
  name: string;
  kind: string;
  items: ListItem[];
}

interface SharedListCardProps {
  list: SharedList;
  onAddItem: (listId: string, text: string) => Promise<{ error?: string; success?: boolean }>;
  onToggleItem: (listId: string, itemIndex: number) => Promise<{ error?: string; success?: boolean }>;
  onDelete: (listId: string) => Promise<{ error?: string; success?: boolean }>;
}

const KIND_LABELS: Record<string, string> = {
  shopping: "Nákupy",
  todo: "Úkoly",
  ideas: "Nápady",
  other: "Ostatní",
};

const KIND_COLORS: Record<string, string> = {
  shopping: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  todo: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  ideas: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function SharedListCard({
  list,
  onAddItem,
  onToggleItem,
  onDelete,
}: SharedListCardProps) {
  const [newItemText, setNewItemText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const items: ListItem[] = Array.isArray(list.items) ? list.items : [];
  const checkedCount = items.filter((i) => i.checked).length;

  function handleAddItem() {
    if (!newItemText.trim()) return;
    startTransition(async () => {
      const result = await onAddItem(list.id, newItemText.trim());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNewItemText("");
    });
  }

  function handleToggle(index: number) {
    startTransition(async () => {
      const result = await onToggleItem(list.id, index);
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await onDelete(list.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Seznam smazán");
      }
      setConfirmDelete(false);
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            {list.name}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] border-0",
                KIND_COLORS[list.kind] ?? KIND_COLORS.other,
              )}
            >
              {KIND_LABELS[list.kind] ?? list.kind}
            </Badge>
            {items.length > 0 && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {checkedCount}/{items.length}
              </span>
            )}
          </CardTitle>

          {/* Delete button */}
          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-destructive">Smazat?</span>
              <Button
                variant="destructive"
                size="xs"
                onClick={handleDelete}
                disabled={isPending}
              >
                Ano
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setConfirmDelete(false)}
              >
                Ne
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Items */}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">
            Seznam je prázdný
          </p>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 group"
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => handleToggle(index)}
              disabled={isPending}
            />
            <span
              className={cn(
                "text-sm transition-all",
                item.checked &&
                  "line-through text-muted-foreground/50",
              )}
            >
              {item.text}
            </span>
          </div>
        ))}

        {/* Add item */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Přidat položku..."
            className="h-8 text-sm flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddItem}
            disabled={isPending || !newItemText.trim()}
            className="h-8 px-2"
          >
            <Plus size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
