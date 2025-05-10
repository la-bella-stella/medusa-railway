"use client";

import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";

interface UseCollectionsParams {
  limit?: number;
}

export function useCollections({ limit = 100 }: UseCollectionsParams = {}) {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const query: { [key: string]: any } = {
        limit,
      };

      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);

      const headers = await getAuthHeaders();
      const next = await getCacheOptions("collections");

      const response = await sdk.client.fetch<{
        collections: HttpTypes.StoreCollection[];
        count: number;
      }>("/store/collections", {
        method: "GET",
        query,
        headers,
        next,
        cache: "force-cache",
      });

      return response.collections.map((collection) => ({
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
      }));
    },
  });
}