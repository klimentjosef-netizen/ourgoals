export interface OFFProduct {
  code: string;
  product_name: string;
  brands: string | null;
  nutriments: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
  image_url?: string;
}

export interface OFFSearchResult {
  products: OFFProduct[];
  count: number;
}

const BASE_URL = "https://world.openfoodfacts.org";

export async function searchOFF(
  query: string,
  page = 1,
  pageSize = 15
): Promise<{ products: OFFProduct[]; total: number }> {
  const url = `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}&countries_tags=en:czech-republic&fields=code,product_name,brands,nutriments,image_url`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) return { products: [], total: 0 };

    const data: OFFSearchResult = await res.json();
    return {
      products: data.products.filter(
        (p) => p.product_name && p.nutriments?.["energy-kcal_100g"]
      ),
      total: data.count,
    };
  } catch {
    return { products: [], total: 0 };
  }
}

export async function getOFFProduct(
  barcode: string
): Promise<OFFProduct | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v2/product/${barcode}?fields=code,product_name,brands,nutriments,image_url`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product ?? null;
  } catch {
    return null;
  }
}

export function offToFoodItem(product: OFFProduct) {
  const n = product.nutriments;
  return {
    name: product.product_name,
    brand: product.brands ?? null,
    kcal_per_100g: Math.round(n["energy-kcal_100g"] ?? 0),
    protein_g: Math.round((n.proteins_100g ?? 0) * 10) / 10,
    carbs_g: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
    fat_g: Math.round((n.fat_100g ?? 0) * 10) / 10,
    fiber_g: n.fiber_100g ? Math.round(n.fiber_100g * 10) / 10 : null,
    source: "openfoodfacts" as const,
    off_code: product.code,
  };
}
