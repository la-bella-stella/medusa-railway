"use client";

import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";
import { retrieveRegion } from "@lib/data/regions";

// --- Extend StoreProduct to include an optional `brand` relation ---
type StoreProductWithBrand = HttpTypes.StoreProduct & {
  brand?: {
    id: string;
    name: string;
    [key: string]: any;
  };
};

// Metadata shape for the grouped_color filter
interface ProductMetadata {
  grouped_color?: string;
  [key: string]: any;
}

export interface UseProductsParams {
  text?: string;
  category?: string; // comma-sep list of category IDs
  collection?: string; // comma-sep list of collection IDs
  brand?: string; // comma-sep list of brand IDs
  type?: string; // comma-sep list of type IDs
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
  infinite?: boolean; // Enable infinite query
}

interface ProductResponse {
  data: StoreProductWithBrand[];
  total: number;
  paginatorInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
}

interface InfiniteProductResponse {
  data: StoreProductWithBrand[];
  total: number;
  region: HttpTypes.StoreRegion | null;
}

// Helper: fetch a Medusa tag ID by its human value
async function getTagIdByValue(value: string): Promise<string | null> {
  try {
    const res = await sdk.client.fetch<{
      product_tags: { id: string; value: string }[];
    }>("/store/product-tags", {
      method: "GET",
      query: { q: value },
      headers: await getAuthHeaders(),
      next: await getCacheOptions("product-tags"),
    });
    const tag = res.product_tags.find(
      (t) => t.value.toLowerCase() === value.toLowerCase()
    );
    return tag?.id ?? null;
  } catch (err) {
    console.error("getTagIdByValue error:", err);
    return null;
  }
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
  brand,
  type,
  orderBy,
  sortedBy,
  gender,
  grouped_color,
  season,
  tags,
  min_price,
  max_price,
  limit = 4,
  page = 1,
  regionId,
  infinite = false,
}: UseProductsParams): UseInfiniteQueryResult<InfiniteProductResponse, Error> | UseQueryResult<ProductResponse, Error> {
  const queryKey = [
    "products",
    text,
    category,
    collection,
    brand,
    type,
    orderBy,
    sortedBy,
    gender,
    grouped_color,
    season,
    tags,
    min_price,
    max_price,
    page,
    regionId,
    infinite ? "infinite" : "paged",
  ];

  const queryFn = async ({ pageParam = 1 }: { pageParam?: number } = {}) => {
    const categoryIds = category?.split(",").map((s) => s.trim());
    const collectionIds = collection?.split(",").map((s) => s.trim());
    const brandIds = brand?.split(",").map((s) => s.trim());
    const typeIds = type?.split(",").map((s) => s.trim());

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

    const query: Record<string, any> = {
      q: text,
      category_id: categoryIds,
      collection_id: collectionIds,
      type_id: typeIds,
      order,
      tag_id: tagIds.length ? tagIds : undefined,
      min_price,
      max_price,
      limit,
      offset: (pageParam - 1) * limit,
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+tags,+categories,+metadata,+type,+quantity,+brand",
    };
    Object.keys(query).forEach((k) => query[k] == null && delete query[k]);

    const headers = await getAuthHeaders();
    const next = await getCacheOptions("products");
    const res = await sdk.client.fetch<{
      products: StoreProductWithBrand[];
      count: number;
    }>("/store/products", {
      method: "GET",
      query,
      headers,
      next,
      cache: "force-cache",
    });

    // Debug: Log raw brand data for each product
    console.log(
      `Products with brands (${infinite ? "infinite" : "paged"}):`,
      res.products.map((p) => ({
        title: p.title,
        id: p.id,
        brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null,
      }))
    );

    let region: HttpTypes.StoreRegion | null = null;
    if (regionId) {
      region = await retrieveRegion(regionId);
    }

    let filtered = res.products;
    if (grouped_color) {
      const colors = grouped_color
        .split(",")
        .map((c) => c.trim().toLowerCase());
      filtered = filtered.filter((p) => {
        const col = ((p.metadata || {}) as ProductMetadata).grouped_color;
        return typeof col === "string" && colors.includes(col.toLowerCase());
      });
    }

    if (brandIds && brandIds.length) {
      filtered = filtered.filter((p) => {
        if (!p.brand?.id) {
          console.warn(`Product ${p.title} (ID: ${p.id}) has no brand ID`, p.brand);
          return false;
        }
        return brandIds.includes(p.brand.id);
      });
    }

    return {
      data: filtered,
      total: res.count,
      region,
      paginatorInfo: {
        total: filtered.length,
        currentPage: pageParam,
        lastPage: Math.ceil(filtered.length / limit),
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
  });
}