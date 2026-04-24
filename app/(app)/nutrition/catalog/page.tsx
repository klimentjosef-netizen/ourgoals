import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@/types/nutrition";
import { CatalogClient } from "@/app/(app)/nutrition/catalog/catalog-client";

export default async function CatalogPage() {
  const user = await getAuthUser();

  let foods: FoodItem[] = [];

  if (!DEV_MODE) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("food_items")
      .select("*")
      .or(`owner_id.eq.${user.id},source.eq.public`)
      .order("name")
      .limit(100);
    foods = (data ?? []) as FoodItem[];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/nutrition"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <BookOpen size={24} className="text-primary" />
          <h1 className="text-xl font-bold">
            Katalog potravin
          </h1>
        </div>
      </div>

      <CatalogClient
        userId={user.id}
        initialFoods={foods}
      />
    </div>
  );
}
