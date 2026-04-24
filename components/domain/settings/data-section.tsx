"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { exportUserData, deleteAccount } from "@/app/(app)/settings/actions";

interface DataSectionProps {
  userId: string;
}

export function DataSection({ userId }: DataSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleExport() {
    startExport(async () => {
      const data = await exportUserData(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ourgoals-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exportována");
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(result.error);
      } else {
        window.location.href = "/login";
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Exportuj svá data nebo smaž účet.
      </p>
      <Button variant="outline" onClick={handleExport} disabled={isExporting} className="w-full h-11">
        <Download size={16} />
        {isExporting ? "Exportuji..." : "Exportovat data (JSON)"}
      </Button>
      <div className="pt-4 border-t border-border">
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full h-11">
          <Trash2 size={16} />
          Smazat účet
        </Button>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Smazat účet
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Opravdu chceš smazat účet? <strong>Tato akce je nevratná.</strong>
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Zrušit</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Mažu..." : "Ano, smazat účet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
