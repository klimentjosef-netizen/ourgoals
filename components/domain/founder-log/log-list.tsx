"use client";

import { useState, useCallback } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogEntry } from "@/components/domain/founder-log/log-entry";
import { LogForm } from "@/components/domain/founder-log/log-form";
import { deleteFounderLogEntry } from "@/app/(app)/founder-log/actions";
import { toast } from "sonner";
import type { FounderLogEntry } from "@/types/founder-log";
import {
  FOUNDER_LOG_CATEGORIES,
  type FounderLogCategory,
} from "@/types/founder-log";

interface LogListProps {
  entries: FounderLogEntry[];
}

export function LogList({ entries }: LogListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FounderLogEntry | undefined>(
    undefined
  );
  const [activeFilter, setActiveFilter] = useState<FounderLogCategory | null>(
    null
  );

  const filteredEntries = activeFilter
    ? entries.filter((e) => e.category === activeFilter)
    : entries;

  const handleEdit = useCallback((entry: FounderLogEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteFounderLogEntry(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Záznam smazán");
    }
  }, []);

  const handleFormSuccess = useCallback(() => {
    setDialogOpen(false);
    setEditingEntry(undefined);
  }, []);

  const openNewForm = useCallback(() => {
    setEditingEntry(undefined);
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Founder Log</h1>
        </div>
        <Button size="sm" onClick={openNewForm}>
          <Plus size={16} />
          Nový záznam
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={activeFilter === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveFilter(null)}
        >
          Vše ({entries.length})
        </Badge>
        {FOUNDER_LOG_CATEGORIES.map((cat) => {
          const count = entries.filter(
            (e) => e.category === cat.value
          ).length;
          if (count === 0) return null;
          return (
            <Badge
              key={cat.value}
              variant={activeFilter === cat.value ? "default" : "outline"}
              className={`cursor-pointer ${
                activeFilter !== cat.value ? cat.color : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  activeFilter === cat.value ? null : cat.value
                )
              }
            >
              {cat.label} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Entries list */}
      {filteredEntries.length > 0 ? (
        <div className="grid gap-3">
          {filteredEntries.map((entry) => (
            <LogEntry
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <BookOpen size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Zapiš si první myšlenku</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Dokumentuj rozhodnutí, nápady a lekce. Tvůj budoucí já ti poděkuje.
              </p>
            </div>
            <Button onClick={openNewForm}>
              <Plus size={16} />
              Přidat první záznam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Žádné záznamy v této kategorii.
          </p>
        </div>
      )}

      {/* Form dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEntry(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Upravit záznam" : "Nový záznam"}
            </DialogTitle>
          </DialogHeader>
          <LogForm entry={editingEntry} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
