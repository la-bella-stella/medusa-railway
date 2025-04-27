// src/lib/hooks/use-products.tsx
"use client";

import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";
import { retrieveRegion } from "@lib/data/regions";
import { getTagIdByValue, listProducts } from "@lib/data/products";

// --- Extend StoreProduct to include an optional `brand` relation ---
export type StoreProductWithBrand = HttpTypes.StoreProduct & {
  brand?: {
    id: string;
    name: string;
    [key: string]: any;
  };
};

// Metadata shape for the grouped_color filter
export interface ProductMetadata {
  grouped_color?: string;
  [key: string]: any;
}

export interface UseProductsParams {
  text?: string;
  category?: string; // comma-sep list of category IDs
  collection?: string; // comma-sep list of collection IDs
  brand?: string; // comma-sep list of brand IDs (will be ignored)
  type?: string; // comma-sep list of type IDs (will be ignored)
  orderBy?: string;
  sortedBy?: string;
  gender?: string; // comma-sep list of gender tag values
  grouped_color?: string; // comma-sep list of color values
  season?: string; // comma-sep list of season tag values
  tags?: string; // comma-sep list of other tag values
  min_price?: string;
  max_price?: string;
  limit?: number;
  page?: number;
  regionId?: string;
  countryCode?: string; // Added to align with listProducts
  infinite?: boolean; // Enable infinite query
}

export interface ProductResponse {
  data: StoreProductWithBrand[];
  total: number;
  paginatorInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface InfiniteProductResponse {
  data: StoreProductWithBrand[];
  total: number;
  region: HttpTypes.StoreRegion | null;
}

export function useProducts(
  params: UseProductsParams & { infinite: true }
): UseInfiniteQueryResult<InfiniteProductResponse, Error>;
export function useProducts(
  params: UseProductsParams & { infinite?: false }
): UseQueryResult<ProductResponse, Error>;
export function useProducts({
  text,
  category,
  collection,
  type,
  orderBy,
  sortedBy,
  gender,
  grouped_color,
  season,
  tags,
  limit = 4,
  page = 1,
  regionId,
  countryCode,
  infinite = false,
}: UseProductsParams): UseInfiniteQueryResult<InfiniteProductResponse, Error> | UseQueryResult<ProductResponse, Error> {
  const queryKey = [
    "products",
    text,
    category,
    collection,
    type,
    orderBy,
    sortedBy,
    gender,
    grouped_color,
    season,
    tags,
    page,
    regionId,
    countryCode,
    infinite ? "infinite" : "paged",
  ];

  const queryFn = async ({ pageParam = 1 }: { pageParam?: number } = {}) => {
    const categoryIds = category?.split(",").map((s) => s.trim());
    const collectionIds = collection?.split(",").map((s) => s.trim());

    const allTagVals = [
      ...(gender?.split(",").map((v) => v.trim()) ?? []),
      ...(season?.split(",").map((v) => v.trim()) ?? []),
      ...(tags?.split(",").map((v) => v.trim()) ?? []),
    ];
    const tagIds: string[] = [];
    try {
      for (const v of allTagVals) {
        const id = await getTagIdByValue(v);
        if (id) tagIds.push(id);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching tag IDs:", error.message);
      // Continue without tag IDs if fetching fails
    }

    let order: string | undefined;
    if (sortedBy) {
      order = orderBy === "desc" ? `-${sortedBy}` : sortedBy;
    }

    const query: Record<string, any> = {
      q: text,
      category_id: categoryIds,
      collection_id: collectionIds,
      order,
      tag_id: tagIds.length ? tagIds : undefined,
      limit,
      offset: (pageParam - 1) * limit,
    };
    Object.keys(query).forEach((k) => query[k] == null && delete query[k]);

    // Log query parameters for debugging
    console.log("Product query params:", query);

    let res;
    try {
      res = await listProducts({
        pageParam,
        queryParams: query,
        regionId,
        countryCode,
      });
    } catch (err) {
      const error = err as Error;
      console.error("Product fetch error:", error.message);
      throw new Error(`Failed to fetch products: ${error.message || "Unknown error"}`);
    }

    // Log raw API response for debugging
    console.log("Product API response:", {
      count: res.response.count,
      products: res.response.products.map((p: HttpTypes.StoreProduct) => ({
        id: p.id,
        title: p.title,
      })),
    });

    let region: HttpTypes.StoreRegion | null = null;
    if (regionId) {
      try {
        region = await retrieveRegion(regionId);
      } catch (err) {
        const error = err as Error;
        console.error("retrieveRegion error:", error.message);
        region = null;
      }
    }

    let filtered = res.response.products as StoreProductWithBrand[];
    if (grouped_color) {
      const colors = grouped_color
        .split(",")
        .map((c) => c.trim().toLowerCase());
      filtered = filtered.filter((p) => {
        const col = ((p.metadata || {}) as ProductMetadata).grouped_color;
        return typeof col === "string" && colors.includes(col.toLowerCase());
      });
    }

    return {
      data: filtered,
      total: res.response.count,
      region,
      paginatorInfo: {
        total: filtered.length,
        currentPage: pageParam,
        lastPage: Math.ceil(res.response.count / limit),
      },
    };
  };

  if (infinite) {
    return useInfiniteQuery<InfiniteProductResponse, Error>({
      queryKey,
      queryFn,
      getNextPageParam: (last, pages) => {
        const fetched = pages.reduce((sum, pg) => sum + pg.data.length, 0);
        return fetched < last.total ? pages.length + 1 : undefined;
      },
      retry: 2,
      retryDelay: 1000,
    });
  }

  return useQuery<ProductResponse, Error>({
    queryKey,
    queryFn: async () => {
      const result = await queryFn({ pageParam: page });
      return {
        data: result.data,
        total: result.total,
        paginatorInfo: result.paginatorInfo,
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
}