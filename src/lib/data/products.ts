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
    console.log("Fetched tags for value:", value, JSON.stringify(product_tags, null, 2));
    const tag = product_tags.find((t) => t.value.toLowerCase() === value.toLowerCase());
    return tag ? tag.id : null;
  } catch (e: any) {
    console.error("Failed to fetch tag ID for value:", value, e.message, e.stack);
    return null;
  }
}

/**
 * Fetches a single product by handle.
 * @param handle - The product handle
 * @param regionId - The region ID
 * @returns The product or undefined if not found
 */
export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | undefined> {
  console.log("getProductByHandle called with:", { handle, regionId });

  try {
    const { products } = await sdk.store.product.list(
      {
        handle,
        region_id: regionId,
        fields: "*variants.calculated_price,*variants.prices,+variants.inventory_quantity,+metadata,+tags",
      },
      { next: { tags: ["products"] }, cache: "no-store" }
    );
    console.log("getProductByHandle - Product fetched:", JSON.stringify(products[0], null, 2));
    console.log("getProductByHandle - Inventory details:", {
      id: products[0]?.id,
      title: products[0]?.title,
      variants: products[0]?.variants?.map((v) => ({
        id: v.id,
        inventory_quantity: v.inventory_quantity,
      })),
    });
    return products[0];
  } catch (e: any) {
    console.error("getProductByHandle - Failed to fetch product:", {
      handle,
      regionId,
      message: e.message,
      stack: e.stack,
    });
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
      console.log("Attempting to retrieve region by ID:", regionId);
      region = await retrieveRegion(regionId);
      console.log("Retrieved region by ID:", region?.id, "Region details:", JSON.stringify(region, null, 2));
    } else if (countryCode) {
      console.log("Attempting to retrieve region by countryCode:", countryCode);
      region = await getRegion(countryCode);
      console.log("Retrieved region by countryCode:", region?.id, "Region details:", JSON.stringify(region, null, 2));
    }

    if (!region) {
      console.warn(
        `Could not resolve region for countryCode=${countryCode} regionId=${regionId}. Falling back to default region.`
      );
      region = {
        id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8",
        currency_code: "USD",
        name: "Default Region",
      } as HttpTypes.StoreRegion;
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
    console.warn(
      `Region resolution failed for countryCode=${countryCode} regionId=${regionId}. Falling back to default region.`
    );
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
      console.warn("No valid tag IDs found for tag values:", query.tag_id);
      delete query.tag_id;
    }
  }

  // Transform id if present
  if (query.id && Array.isArray(query.id)) {
    query["id[]"] = query.id;
    delete query.id;
  }

  // Log if fetching by handle
  if (query.handle) {
    console.log("Fetching product by handle:", query.handle);
  }

  console.log("Fetching products with query:", JSON.stringify(query, null, 2));

  try {
    const { products, count } = await sdk.store.product.list(query, {
      next: { tags: ["products"] },
      cache: "no-store",
    });

    console.log("API Response:", JSON.stringify({ products, count }, null, 2));
    console.log("Fetched products:", products.length, "Count:", count);
    // Log inventory details
    console.log(
      "Inventory details:",
      products.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants?.map((v) => ({
          id: v.id,
          inventory_quantity: v.inventory_quantity,
        })),
      }))
    );
    if (query["tag_id[]"]) {
      console.log("Products with tag_id[]", query["tag_id[]"], ":", JSON.stringify(products, null, 2));
    }
    if (query.handle) {
      console.log("Product fetched by handle:", query.handle, JSON.stringify(products, null, 2));
    }

    return {
      response: { products, count },
      nextPage: count > offset + limit ? pageParam + 1 : null,
      queryParams,
    };
  } catch (e: any) {
    const errorDetails = {
      message: e.message || "Unknown error",
      status: e.status || e.response?.status || "N/A",
      data: e.response?.data || e.data || {},
      stack: e.stack || "N/A",
    };
    console.error("Failed to fetch products:", JSON.stringify(errorDetails, null, 2));
    throw new Error(
      `Failed to fetch products: ${errorDetails.message}. Status: ${errorDetails.status}. Details: ${JSON.stringify(errorDetails.data)}`
    );
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