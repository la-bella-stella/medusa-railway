"use server";

import { sdk } from "@lib/config";
import { sortProducts } from "@lib/util/sort-products";
import { HttpTypes } from "@medusajs/types";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { getAuthHeaders, getCacheOptions } from "./cookies";
import { getRegion, retrieveRegion } from "./regions";
import { cookies } from "next/headers";
import { cache } from "react";

export type ListProductsParams = {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & {
      handle?: string;
      id?: string[];
      tag_id?: string[];
      created_at?: { gte?: string; lte?: string };
    };
  countryCode?: string;
  regionId?: string;
};

/**
 * Fetches the tag ID for a given tag value from the Medusa backend.
 */
export async function getTagIdByValue(value: string): Promise<string | null> {
  try {
    const { product_tags } = await sdk.client.fetch<{
      product_tags: { id: string; value: string }[];
    }>("/store/product-tags", {
      method: "GET",
      query: { q: value },
      headers: await getAuthHeaders(),
      next: await getCacheOptions("product-tags"),
    });
    const tag = product_tags.find((t) => t.value.toLowerCase() === value.toLowerCase());
    if (!tag) {
      console.warn(`No tag found for value: "${value}"`);
      return null;
    }
    return tag.id;
  } catch (e: any) {
    console.error("Failed to fetch tag ID for value:", value, { message: e.message });
    return null;
  }
}

/**
 * Fetches a single product by handle.
 */
export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | undefined> {
  try {
    const { products } = await sdk.store.product.list(
      {
        handle,
        region_id: regionId,
        fields: "*variants.calculated_price,*variants.prices,+variants.inventory_quantity,+metadata,+tags",
      },
      { next: { tags: ["products"] }, cache: "no-store" }
    );
    return products[0];
  } catch (e: any) {
    console.error("getProductByHandle failed:", { handle, regionId, message: e.message });
    return undefined;
  }
});

/**
 * Fetches a list of products with pagination and filtering.
 */
export async function listProducts({
  pageParam = 1,
  queryParams = {},
  countryCode,
  regionId,
}: ListProductsParams): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: typeof queryParams;
}> {
  if (!countryCode && !regionId) {
    const cookieStore = await cookies();
    countryCode =
      cookieStore.get("NEXT_LOCALE")?.value?.toLowerCase() ||
      process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase() ||
      "us";
  }

  let region: HttpTypes.StoreRegion | null | undefined = null;
  try {
    if (regionId) {
      if (regionId === "reg_01JSW66RFBTQRDR1PX0A3MQJP8") {
        region = {
          id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8",
          currency_code: "USD",
          name: "Default Region",
        } as HttpTypes.StoreRegion;
      } else {
        region = await retrieveRegion(regionId);
      }
    } else if (countryCode) {
      region = await getRegion(countryCode);
    }

    if (!region) {
      console.warn(`Could not resolve region for countryCode=${countryCode} regionId=${regionId}. Falling back to default region.`);
      region = {
        id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8",
        currency_code: "USD",
        name: "Default Region",
      } as HttpTypes.StoreRegion;
    }
  } catch (e: any) {
    console.error("Region resolution failed:", {
      message: e.message,
      countryCode,
      regionId,
    });
    region = {
      id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8",
      currency_code: "USD",
      name: "Default Region",
    } as HttpTypes.StoreRegion;
  }

  const limit = queryParams.limit ?? 12;
  const _page = Math.max(pageParam, 1);
  const offset = _page === 1 ? 0 : (_page - 1) * limit;

  const query: { [key: string]: any } = {
    limit,
    offset,
    region_id: region.id,
    ...queryParams,
    fields:
      queryParams.fields ??
      "*variants.calculated_price,*variants.prices,+variants.inventory_quantity,+metadata,+tags",
  };

  if (query.tag_id && Array.isArray(query.tag_id)) {
    const tagIds = [];
    for (const tag of query.tag_id) {
      const tagId = await getTagIdByValue(tag);
      if (tagId) {
        tagIds.push(tagId);
      }
    }
    if (tagIds.length > 0) {
      query["tag_id[]"] = tagIds;
    } else {
      console.warn("No valid tag IDs found for tag values:", query.tag_id);
      delete query.tag_id;
    }
  }

  if (query.id && Array.isArray(query.id)) {
    query["id[]"] = query.id;
    delete query.id;
  }

  try {
    const { products, count } = await sdk.store.product.list(query, {
      next: { tags: ["products"] },
      cache: "no-store",
    });
    return {
      response: { products, count },
      nextPage: count > offset + limit ? pageParam + 1 : null,
      queryParams,
    };
  } catch (e: any) {
    console.error("Failed to fetch products:", {
      message: e.message,
      status: e.status || e.response?.status || "N/A",
    });
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    };
  }
}

/**
 * Fetches and sorts products with pagination.
 */
export async function listProductsWithSort({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  sortBy?: SortOptions;
  countryCode: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: typeof queryParams;
}> {
  const limit = queryParams?.limit ?? 12;

  try {
    const {
      response: { products: allProducts, count },
    } = await listProducts({
      pageParam: 1,
      queryParams: { ...(queryParams ?? {}), limit: 100 },
      countryCode,
    });

    const sorted = sortProducts(allProducts, sortBy);
    const pageIndex = page > 0 ? page - 1 : 0;
    const start = pageIndex * limit;
    const paginated = sorted.slice(start, start + limit);
    const nextPage = count > (pageIndex + 1) * limit ? page + 1 : null;

    return {
      response: { products: paginated, count },
      nextPage,
      queryParams,
    };
  } catch (e: any) {
    console.error("Failed to fetch sorted products:", { message: e.message });
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    };
  }
}