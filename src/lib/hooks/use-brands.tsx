"use client";

import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";

interface UseBrandsParams {
  limit?: number;
  regionId?: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export function useBrands({ limit = 100, regionId }: UseBrandsParams = {}) {
  return useQuery<Brand[], Error>({
    queryKey: ["brands", regionId],
    queryFn: async () => {
      const query: { [key: string]: any } = {
        limit,
        region_id: regionId,
        fields: "*brand",
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

      // Extract unique brands from products
      const brandsMap = new Map<string, Brand>();
      response.products.forEach((product: any) => {
        if (product.brand && product.brand.id && product.brand.name) {
          brandsMap.set(product.brand.id, {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.id.toLowerCase().replace(/\s+/g, "_"),
          });
        }
      });

      return Array.from(brandsMap.values());
    },
  });
}