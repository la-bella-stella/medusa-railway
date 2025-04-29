"use client";

import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { getTagIdByValue, listProducts } from "@lib/data/products";
import { retrieveRegion } from "@lib/data/regions";

export type StoreProductWithBrand = HttpTypes.StoreProduct & {
  brand?: {
    id: string;
    name: string;
    [key: string]: any;
  };
  variantId?: string;
  variants?: HttpTypes.StoreProductVariant[] | null;
};

export interface ProductMetadata {
  grouped_color?: string;
  [key: string]: any;
}

export interface UseProductsParams {
  text?: string;
  category?: string;
  collection?: string;
  type?: string;
  orderBy?: string;
  sortedBy?: string;
  gender?: string;
  grouped_color?: string;
  season?: string;
  tags?: string;
  min_price?: string;
  max_price?: string;
  limit?: number;
  page?: number;
  regionId?: string;
  countryCode?: string;
  infinite?: boolean;
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
  limit = 12,
  page = 1,
  regionId,
  countryCode,
  infinite = false,
}: UseProductsParams): any {
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
    for (const v of allTagVals) {
      const id = await getTagIdByValue(v);
      if (id) tagIds.push(id);
    }

    let order: string | undefined;
    if (sortedBy) {
      order = orderBy === "desc" ? `-${sortedBy}` : sortedBy;
    }

    const q: Record<string, any> = {
      q: text,
      category_id: categoryIds,
      collection_id: collectionIds,
      order,
      tag_id: tagIds.length ? tagIds : undefined,
      limit,
      offset: (pageParam - 1) * limit,
    };
    Object.keys(q).forEach((k) => q[k] == null && delete q[k]);

    console.log("useProducts query params:", q);

    const res = await listProducts({
      pageParam,
      queryParams: q,
      regionId,
      countryCode,
    });

    console.log("useProducts API response:", {
      count: res.response.count,
      products: res.response.products.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants
          ? p.variants.map((v) => ({
              id: v.id,
              inventory_quantity: v.inventory_quantity,
              manage_inventory: v.manage_inventory,
              allow_backorder: v.allow_backorder,
            }))
          : "No variants available",
      })),
    });

    let region: HttpTypes.StoreRegion | null = null;
    if (regionId) {
      try {
        region = await retrieveRegion(regionId);
      } catch {
        region = null;
      }
    }

    let filtered = (res.response.products as StoreProductWithBrand[]).map((p) => ({
      ...p,
      variantId: p.variants && p.variants.length > 0 ? p.variants[0].id : undefined,
    }));

    if (grouped_color) {
      const colors = grouped_color.split(",").map((c) => c.trim().toLowerCase());
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
        total: res.response.count,
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