import { getAuthUser } from "@/lib/auth";
import { getBodyMetrics, getLatestMetric } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingDown, TrendingUp, Minus, Scale } from "lucide-react";
import { BodyMetricForm } from "@/components/domain/body/metric-form";
import type { BodyMetric } from "@/types/training";

export default async function BodyPage() {
  const user = await getAuthUser();
  const metrics = (await getBodyMetrics(user.id, 14)) as BodyMetric[];
  const latest = (await getLatestMetric(user.id)) as BodyMetric | null;

  const prev = metrics.length > 1 ? metrics[1] : null;
  const weightDiff = latest?.weight_kg && prev?.weight_kg
    ? latest.weight_kg - prev.weight_kg
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Tělo & Metriky</h1>
        </div>
        <BodyMetricForm />
      </div>

      {/* Latest metrics */}
      {latest ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Aktuální stav
              <span className="text-xs font-mono text-muted-foreground">
                {new Date(latest.date).toLocaleDateString("cs-CZ")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold tabular-nums">{latest.weight_kg} kg</p>
                  {weightDiff !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      {weightDiff > 0 ? (
                        <TrendingUp size={12} className="text-red-500" />
                      ) : weightDiff < 0 ? (
                        <TrendingDown size={12} className="text-green-500" />
                      ) : (
                        <Minus size={12} className="text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground font-mono">
                        {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {latest.body_fat_pct && (
                <div>
                  <p className="text-xs text-muted-foreground">Body fat</p>
                  <p className="text-xl font-bold tabular-nums">{latest.body_fat_pct}%</p>
                </div>
              )}
            </div>

            {/* Measurements */}
            {(latest.waist_cm || latest.chest_cm || latest.arm_cm) && (
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                {[
                  { label: "Pas", val: latest.waist_cm },
                  { label: "Hrudník", val: latest.chest_cm },
                  { label: "Boky", val: latest.hip_cm },
                  { label: "Stehno", val: latest.thigh_cm },
                  { label: "Paže", val: latest.arm_cm },
                ].filter(m => m.val).map(m => (
                  <div key={m.label} className="text-center">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-bold tabular-nums">{m.val} cm</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Scale size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Začni sledovat tělesné metriky</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Měř váhu, body fat a obvody. Sleduj trendy a pokrok.
              </p>
            </div>
            <BodyMetricForm />
          </CardContent>
        </Card>
      )}

      {/* Weight trend */}
      {metrics.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trend váhy ({metrics.length} měření)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {[...metrics].reverse().map((m) => {
                const weights = metrics.map(x => x.weight_kg ?? 0).filter(Boolean);
                const min = Math.min(...weights) - 1;
                const max = Math.max(...weights) + 1;
                const range = max - min || 1;
                const height = ((m.weight_kg ?? min) - min) / range * 100;
                return (
                  <div
                    key={m.id}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative group"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {m.weight_kg}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {metrics.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Historie
          </h2>
          {metrics.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {new Date(m.date).toLocaleDateString("cs-CZ")}
                </span>
                <div className="flex gap-3 text-sm font-mono">
                  {m.weight_kg && <span>{m.weight_kg} kg</span>}
                  {m.body_fat_pct && <Badge variant="outline" className="text-[10px]">{m.body_fat_pct}% BF</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
