import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CalendarConnectPage() {
  return (
    <div className="container max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/calendar">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Připojit kalendář</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Propoj svůj externí kalendář s OurGoals a měj vše na jednom místě.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Google Calendar */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="currentColor">
                  <path d="M19.5 3.5h-1V2h-2v1.5h-9V2h-2v1.5h-1A2 2 0 002.5 5.5v14a2 2 0 002 2h15a2 2 0 002-2v-14a2 2 0 00-2-2zm0 16h-15v-11h15v11z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-base">Google Kalendář</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Synchronizuj eventy z Google Kalendáře. Obousměrná synchronizace.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled className="flex-1">
                Připojit
              </Button>
              <Badge variant="secondary" className="text-xs">
                Brzy dostupné
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Apple Calendar */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-base">Apple Kalendář</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import eventů z Apple Kalendáře přes CalDAV protokol.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled className="flex-1">
                Připojit
              </Button>
              <Badge variant="secondary" className="text-xs">
                Brzy dostupné
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground/50 pt-4">
        Mezitím můžeš exportovat eventy přes ICS tlačítko v kalendáři.
      </div>
    </div>
  );
}
