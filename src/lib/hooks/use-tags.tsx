"use client";

import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";

interface UseTagsParams {
  limit?: number;
}

interface Tag {
  id: string;
  value: string;
}

export function useTags({ limit = 100 }: UseTagsParams = {}) {
  return useQuery<Tag[], Error>({
    queryKey: ["tags"],
    queryFn: async () => {
      const query: { [key: string]: any } = {
        limit,
      };

      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);

      const headers = await getAuthHeaders();
      const next = await getCacheOptions("product-tags");

      const response = await sdk.client.fetch<{
        product_tags: HttpTypes.StoreProductTag[];
        count: number;
      }>("/store/product-tags", {
        method: "GET",
        query,
        headers,
        next,
        cache: "force-cache",
      });

      return response.product_tags.map((tag) => ({
        id: tag.id,
        value: tag.value,
      }));
    },
  });
}