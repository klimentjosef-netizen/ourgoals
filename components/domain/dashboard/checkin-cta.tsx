"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CheckinCtaProps {
  morningDone: boolean;
  eveningDone: boolean;
}

export function CheckinCta({ morningDone, eveningDone }: CheckinCtaProps) {
  // Both done — don't show
  if (morningDone && eveningDone) return null;

  const hour = new Date().getHours();

  // Morning not done — prominent banner
  if (!morningDone) {
    return (
      <Card className="border-primary bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-base">
                🌅 Dobré ráno! Check-in čeká.
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Zabere to jen minutku — nastartuj svůj den.
              </p>
            </div>
            <Link href="/checkin" className="shrink-0">
              <Button size="lg">Udělat ranní check-in →</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Morning done, evening not done — smaller banner
  if (hour >= 16) {
    return (
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              🌙 Večerní check-in čeká
            </p>
            <Link href="/checkin" className="shrink-0">
              <Button variant="outline" size="sm">
                Check-in →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
