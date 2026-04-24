import { ArrowLeft, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import {
  getWeeklyMacros,
  getUserTargets,
} from "@/app/(app)/nutrition/actions";
import { format, subDays } from "date-fns";

const DAY_NAMES = ["Po", "Ut", "St", "Ct", "Pa", "So", "Ne"];

function TrendIcon({
  value,
  target,
}: {
  value: number;
  target: number;
}) {
  if (target === 0 || value === 0)
    return (
      <Minus size={10} className="text-muted-foreground" />
    );
  const ratio = value / target;
  if (ratio > 1.1)
    return <ArrowUp size={10} className="text-red-500" />;
  if (ratio < 0.8)
    return (
      <ArrowDown size={10} className="text-yellow-500" />
    );
  return <Minus size={10} className="text-green-500" />;
}

function cellColor(
  value: number,
  target: number
): string {
  if (target === 0 || value === 0) return "";
  const diff = Math.abs(value - target) / target;
  if (diff <= 0.1) return "text-green-500";
  if (diff <= 0.2) return "text-yellow-500";
  return "text-red-500";
}

export default async function NutritionWeekPage() {
  const user = await getAuthUser();

  const [weekData, targets] = await Promise.all([
    getWeeklyMacros(user.id),
    getUserTargets(user.id),
  ]);

  const targetP = targets.protein_g;
  const targetC = targets.carbs_g;
  const targetF = targets.fat_g;
  const targetKcal = targetP * 4 + targetC * 4 + targetF * 9;

  // Build display data with day names
  const displayData = weekData.map((d) => {
    const date = new Date(d.date);
    const dayIdx = (date.getDay() + 6) % 7;
    return {
      ...d,
      dayName: DAY_NAMES[dayIdx],
      dateLabel: format(date, "d.M."),
    };
  });

  // Averages (only days with data)
  const daysWithData = weekData.filter(
    (d) => d.totals.kcal > 0
  );
  const count = daysWithData.length || 1;
  const avg = {
    kcal: Math.round(
      daysWithData.reduce(
        (s, d) => s + d.totals.kcal,
        0
      ) / count
    ),
    protein: Math.round(
      daysWithData.reduce(
        (s, d) => s + d.totals.protein,
        0
      ) / count
    ),
    carbs: Math.round(
      daysWithData.reduce(
        (s, d) => s + d.totals.carbs,
        0
      ) / count
    ),
    fat: Math.round(
      daysWithData.reduce(
        (s, d) => s + d.totals.fat,
        0
      ) / count
    ),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/nutrition"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">
          Tydenni prehled
        </h1>
      </div>

      {/* Weekly table */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left pr-2"></th>
                {displayData.map((d) => (
                  <th
                    key={d.date}
                    className="text-center px-1 pb-2"
                  >
                    <div>{d.dayName}</div>
                    <div className="text-[9px] font-normal">
                      {d.dateLabel}
                    </div>
                  </th>
                ))}
                <th className="text-center px-1 pb-2 font-bold">
                  Prumer
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="pr-2 py-1 text-muted-foreground">
                  kcal
                </td>
                {displayData.map((d) => (
                  <td
                    key={d.date}
                    className={`text-center px-1 py-1 ${cellColor(d.totals.kcal, targetKcal)}`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      {d.totals.kcal > 0
                        ? Math.round(d.totals.kcal)
                        : "-"}
                      {d.totals.kcal > 0 && (
                        <TrendIcon
                          value={d.totals.kcal}
                          target={targetKcal}
                        />
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center px-1 py-1 font-bold">
                  {avg.kcal}
                </td>
              </tr>
              <tr className="border-t">
                <td className="pr-2 py-1 text-blue-500">
                  P (g)
                </td>
                {displayData.map((d) => (
                  <td
                    key={d.date}
                    className={`text-center px-1 py-1 ${cellColor(d.totals.protein, targetP)}`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      {d.totals.protein > 0
                        ? Math.round(d.totals.protein)
                        : "-"}
                      {d.totals.protein > 0 && (
                        <TrendIcon
                          value={d.totals.protein}
                          target={targetP}
                        />
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center px-1 py-1 font-bold">
                  {avg.protein}
                </td>
              </tr>
              <tr className="border-t">
                <td className="pr-2 py-1 text-amber-500">
                  C (g)
                </td>
                {displayData.map((d) => (
                  <td
                    key={d.date}
                    className={`text-center px-1 py-1 ${cellColor(d.totals.carbs, targetC)}`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      {d.totals.carbs > 0
                        ? Math.round(d.totals.carbs)
                        : "-"}
                      {d.totals.carbs > 0 && (
                        <TrendIcon
                          value={d.totals.carbs}
                          target={targetC}
                        />
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center px-1 py-1 font-bold">
                  {avg.carbs}
                </td>
              </tr>
              <tr className="border-t">
                <td className="pr-2 py-1 text-purple-500">
                  F (g)
                </td>
                {displayData.map((d) => (
                  <td
                    key={d.date}
                    className={`text-center px-1 py-1 ${cellColor(d.totals.fat, targetF)}`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      {d.totals.fat > 0
                        ? Math.round(d.totals.fat)
                        : "-"}
                      {d.totals.fat > 0 && (
                        <TrendIcon
                          value={d.totals.fat}
                          target={targetF}
                        />
                      )}
                    </div>
                  </td>
                ))}
                <td className="text-center px-1 py-1 font-bold">
                  {avg.fat}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Averages card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Denni prumer vs. cil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div>
              <p className="text-muted-foreground">kcal</p>
              <p className="text-lg font-bold">{avg.kcal}</p>
              <p className="text-[10px] text-muted-foreground">
                cil: {targetKcal}
              </p>
            </div>
            <div>
              <p className="text-blue-500">P</p>
              <p className="text-lg font-bold">
                {avg.protein}g
              </p>
              <p className="text-[10px] text-muted-foreground">
                cil: {targetP}g
              </p>
            </div>
            <div>
              <p className="text-amber-500">C</p>
              <p className="text-lg font-bold">
                {avg.carbs}g
              </p>
              <p className="text-[10px] text-muted-foreground">
                cil: {targetC}g
              </p>
            </div>
            <div>
              <p className="text-purple-500">F</p>
              <p className="text-lg font-bold">
                {avg.fat}g
              </p>
              <p className="text-[10px] text-muted-foreground">
                cil: {targetF}g
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
