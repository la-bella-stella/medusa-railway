"use server";

import { sdk } from "@lib/config";
import { sortProducts } from "@lib/util/sort-products";
import { HttpTypes } from "@medusajs/types";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { getAuthHeaders, getCacheOptions } from "./cookies";
import { getRegion, retrieveRegion } from "./regions";
import { cookies } from "next/headers";

export type ListProductsParams = {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & {
      /** Filter by product handle (server-side) */
      handle?: string;
      /** Filter by product IDs (server-side) */
      id?: string[];
      /** Filter by product tag IDs or values (server-side) */
      tag_id?: string[];
      /** Filter by creation date (e.g., created within the last 30 days) */
      created_at?: { gte?: string; lte?: string };
    };
  /** optional — if omitted we'll pick it up from the cookie or default */
  countryCode?: string;
  /** optional — you can still pass a region ID directly */
  regionId?: string;
};

/**
 * Fetches the tag ID for a given tag value from the Medusa backend.
 * @param value - The tag value (e.g., "flash-sale")
 * @returns The tag ID (e.g., "ptag_01...") or null if not found
 */
async function getTagIdByValue(value: string): Promise<string | null> {
  try {
    const { product_tags } = await sdk.client.fetch<{
      product_tags: { id: string; value: string }[];
    }>("/store/product-tags", {
      method: "GET",
      query: { q: value },
      headers: await getAuthHeaders(),
      next: await getCacheOptions("product-tags"),
    });
    console.log("Fetched tags for value:", value, JSON.stringify(product_tags, null, 2));
    const tag = product_tags.find((t) => t.value.toLowerCase() === value.toLowerCase());
    return tag ? tag.id : null;
  } catch (e: any) {
    console.error("Failed to fetch tag ID for value:", value, e.message, e.stack);
    return null;
  }
}

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
  console.log("listProducts called with:", { pageParam, queryParams, countryCode, regionId });

  if (!countryCode && !regionId) {
    const cookieStore = await cookies();
    countryCode =
      cookieStore.get("NEXT_LOCALE")?.value?.toLowerCase() ||
      process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase() ||
      "us";
    console.log("No regionId/countryCode provided, using countryCode:", countryCode);
  }

  let region: HttpTypes.StoreRegion | null | undefined = null;
  try {
    if (regionId) {
      region = await retrieveRegion(regionId);
      console.log("Retrieved region by ID:", region?.id, "Region details:", JSON.stringify(region, null, 2));
    } else if (countryCode) {
      region = await getRegion(countryCode);
      console.log("Retrieved region by countryCode:", region?.id, "Region details:", JSON.stringify(region, null, 2));
    }

    if (!region) {
      throw new Error(
        `Could not resolve region for countryCode=${countryCode} regionId=${regionId}`
      );
    }
  } catch (e: any) {
    console.error(
      "Region resolution failed:",
      e.message,
      "Details:",
      JSON.stringify(e.response?.data || {}),
      "Stack:",
      e.stack
    );
    throw new Error(
      `Region resolution failed: ${e.message}. Details: ${JSON.stringify(e.response?.data || {})}`
    );
  }

  const limit = queryParams.limit ?? 12;
  const _page = Math.max(pageParam, 1);
  const offset = _page === 1 ? 0 : (_page - 1) * limit;

  const headers = await getAuthHeaders();
  const next = await getCacheOptions("products");

  // Use a flexible type to allow dynamic keys like tag_id[] and id[]
  const query: { [key: string]: any } = {
    limit,
    offset,
    region_id: region.id,
    ...queryParams,
    fields:
      queryParams.fields ??
      "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
  };

  // Transform tag_id if present: resolve tag values to tag IDs
  if (query.tag_id && Array.isArray(query.tag_id)) {
    const tagIds = [];
    for (const tag of query.tag_id) {
      const tagId = await getTagIdByValue(tag);
      if (tagId) {
        tagIds.push(tagId);
      } else {
        console.warn(`Tag value "${tag}" not found in Medusa backend`);
      }
    }
    if (tagIds.length > 0) {
      query["tag_id[]"] = tagIds;
    } else {
      console.warn("No valid tag IDs found for provided tag values:", query.tag_id);
      query["tag_id[]"] = query.tag_id; // Fallback to original values if no IDs found
    }
    delete query.tag_id;
  }

  // Transform id if present
  if (query.id && Array.isArray(query.id)) {
    query["id[]"] = query.id;
    delete query.id;
  }

  console.log("Fetching products with query:", JSON.stringify(query, null, 2));

  try {
    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[];
      count: number;
    }>(
      "/store/products",
      {
        method: "GET",
        query,
        headers,
        next,
        cache: "no-store", // Changed to no-store for debugging; revert to "force-cache" after testing
      }
    );

    console.log("API Response:", JSON.stringify(response, null, 2));
    console.log("Fetched products:", response.products.length, "Count:", response.count);
    if (query["tag_id[]"]) {
      console.log("Products with tags", query["tag_id[]"], ":", JSON.stringify(response.products, null, 2));
    }

    return {
      response: { products: response.products, count: response.count },
      nextPage: response.count > offset + limit ? pageParam + 1 : null,
      queryParams,
    };
  } catch (e: any) {
    const errorDetails = {
      message: e.message || "Unknown error",
      status: e.response?.status || "N/A",
      data: e.response?.data || {},
      stack: e.stack,
    };
    console.error("Failed to fetch products:", JSON.stringify(errorDetails, null, 2));
    throw new Error(
      `Failed to fetch products: ${errorDetails.message}. Status: ${errorDetails.status}. Details: ${JSON.stringify(errorDetails.data)}`
    );
  }
}

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

    // Convert 1-based `page` to zero-based index for slicing
    const sorted = sortProducts(allProducts, sortBy);
    const pageIndex = page > 0 ? page - 1 : 0;
    const start = pageIndex * limit;
    const paginated = sorted.slice(start, start + limit);
    const nextPage = count > (pageIndex + 1) * limit ? page + 1 : null;

    console.log("Sorted products:", paginated.length, "Count:", count);

    return {
      response: { products: paginated, count },
      nextPage,
      queryParams,
    };
  } catch (e: any) {
    const errorDetails = {
      message: e.message || "Unknown error",
      status: e.response?.status || "N/A",
      data: e.response?.data || {},
      stack: e.stack,
    };
    console.error("Failed to fetch sorted products:", JSON.stringify(errorDetails, null, 2));
    throw new Error(
      `Failed to fetch sorted products: ${errorDetails.message}. Status: ${errorDetails.status}. Details: ${JSON.stringify(errorDetails.data)}`
    );
  }
}