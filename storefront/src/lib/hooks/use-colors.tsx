"use client";

import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";

interface UseColorsParams {
  limit?: number;
  regionId?: string;
}

interface Color {
  id: string;
  value: string;
  meta: string; // Hex code (e.g., "#FF0000")
}

export function useColors({ limit = 100, regionId }: UseColorsParams = {}) {
  return useQuery({
    queryKey: ["colors", regionId],
    queryFn: async () => {
      const query: { [key: string]: any } = {
        limit,
        region_id: regionId,
        fields: "*grouped_color",
      };

      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);

      const headers = await getAuthHeaders();
      const next = await getCacheOptions("products");

      const response = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[];
        count: number;
      }>("/store/products", {
        method: "GET",
        query,
        headers,
        next,
        cache: "force-cache",
      });

      // Extract unique colors from products
      const colorsMap = new Map<string, Color>();
      response.products.forEach((product: any) => {
        if (product.grouped_color && product.grouped_color.value) {
          const hex = product.grouped_color.meta?.hex || "#000000"; // Fallback hex code
          colorsMap.set(product.grouped_color.value, {
            id: product.grouped_color.value.toLowerCase().replace(/\s+/g, "-"),
            value: product.grouped_color.value,
            meta: hex,
          });
        }
      });

      return Array.from(colorsMap.values());
    },
  });
}