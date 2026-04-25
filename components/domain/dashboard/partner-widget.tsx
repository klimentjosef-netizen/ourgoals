"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

interface PartnerWidgetProps {
  gottmanScore: { ratio: number; status: "good" | "warning" | "danger" } | null;
  unreadCount: number;
  hasHousehold: boolean;
}

const statusColor: Record<string, string> = {
  good: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
};

export function PartnerWidget({
  gottmanScore,
  unreadCount,
  hasHousehold,
}: PartnerWidgetProps) {
  if (!hasHousehold) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart size={16} className="text-pink-500" />
          Partner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gottmanScore && (
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusColor[gottmanScore.status] ?? "bg-gray-400"}`}
            />
            <span className="text-sm font-medium">
              Gottman skóre: {gottmanScore.ratio}
            </span>
          </div>
        )}

        {unreadCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {unreadCount}{" "}
            {unreadCount === 1
              ? "nepřečtený vzkaz"
              : unreadCount < 5
                ? "nepřečtené vzkazy"
                : "nepřečtených vzkazů"}
          </p>
        )}

        <Link href="/partner">
          <Button variant="outline" size="sm" className="w-full">
            Poslat vzkaz &rarr;
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
