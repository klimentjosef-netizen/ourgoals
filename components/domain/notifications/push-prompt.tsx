"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import {
  registerServiceWorker,
  requestNotificationPermission,
  canShowNotifications,
  notificationPermissionState,
} from "@/lib/notifications/sw-register";

export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register SW on mount
    registerServiceWorker();

    // Check if we should show prompt
    const state = notificationPermissionState();
    const wasDismissed = localStorage.getItem("ourgoals-push-dismissed");

    if (state === "default" && !wasDismissed && canShowNotifications()) {
      // Delay prompt by 5 seconds
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleEnable() {
    const granted = await requestNotificationPermission();
    if (granted) {
      // Show a test notification
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("OurGoals", {
          body: "Notifikace zapnuty! Budeme ti připomínat check-iny.",
          icon: "/icon-192.png",
        });
      }
    }
    setShow(false);
  }

  function handleDismiss() {
    setDismissed(true);
    setShow(false);
    localStorage.setItem("ourgoals-push-dismissed", "true");
  }

  if (!show || dismissed) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-3 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Zapni notifikace</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Připomeneme ti ranní a večerní check-in. Žádný spam.
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleEnable}>
                Zapnout
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Teď ne
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
