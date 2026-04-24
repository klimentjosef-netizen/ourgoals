import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-7 w-20" />
      </div>
      {/* Level & XP card */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </CardContent>
      </Card>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="pt-4"><Skeleton className="h-14" /></CardContent></Card>
        <Card><CardContent className="pt-4"><Skeleton className="h-14" /></CardContent></Card>
      </div>
      {/* Achievements */}
      <Card>
        <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    </div>
  );
}
