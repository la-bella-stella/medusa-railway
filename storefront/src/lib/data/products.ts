"use server";

import { sdk } from "@lib/config";
import { sortProducts } from "@lib/util/sort-products";
import { HttpTypes } from "@medusajs/types";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { getAuthHeaders, getCacheOptions } from "./cookies";
import { getRegion, retrieveRegion } from "@lib/data/regions";
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
    const response = await sdk.client.fetch<{
      product_tags: { id: string; value: string }[];
    }>("/store/product-tags", {
      method: "GET",
      query: { q: value },
      headers: await getAuthHeaders(),
      next: await getCacheOptions("product-tags"),
    });
    const tag = response.product_tags.find(
      (t) => t.value.toLowerCase() === value.toLowerCase()
    );
    return tag ? tag.id : null;
  } catch (e: any) {
    return null;
  }
}

/**
 * Fetches a single product by handle.
 */
export const getProductByHandle = cache(
  async (
    handle: string,
    regionId: string
  ): Promise<HttpTypes.StoreProduct | undefined> => {
    try {
      const response = await sdk.store.product.list(
        {
          handle,
          region_id: regionId,
          fields:
            "*variants.calculated_price,*variants.prices,*variants.options,+variants.inventory_quantity,+variants.allow_backorder,+variants.manage_inventory,+metadata,+tags",
        },
        {
          next: { tags: ["products"] },
          cache: "no-store",
        }
      );
      const product = response.products[0];

      if (product) {
        console.log("getProductByHandle inventory:", {
          handle,
          regionId,
          variants: product.variants
            ? product.variants.map((v) => ({
                id: v.id,
                inventory_quantity: v.inventory_quantity,
                manage_inventory: v.manage_inventory,
                allow_backorder: v.allow_backorder,
              }))
            : "No variants available",
        });
      } else {
        console.warn("getProductByHandle: No product found for handle:", handle);
      }
      return product;
    } catch (e: any) {
      console.error("getProductByHandle failed:", { handle, regionId, error: e.message });
      return undefined;
    }
  }
);

/**
 * Fetches a list of products with pagination and filtering.
 */
export async function listProducts(
  params: ListProductsParams
): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: typeof params.queryParams;
}> {
  let { pageParam = 1, queryParams = {}, countryCode, regionId } = params;

  if (!countryCode && !regionId) {
    const cookieStore = await cookies();
    countryCode =
      cookieStore.get("NEXT_LOCALE")?.value?.toLowerCase() ||
      process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase() ||
      "us";
  }

  const DEFAULT_REGION_ID = "reg_01JVDHXWGRAG2DCGP3894QA4WX";
  let region: HttpTypes.StoreRegion;

  if (regionId) {
    if (regionId === DEFAULT_REGION_ID) {
      region = {
        id: DEFAULT_REGION_ID,
        currency_code: "USD",
        name: "Default Region",
      };
    } else {
      try {
        region = await retrieveRegion(regionId);
      } catch (e: any) {
        console.warn("Failed to retrieve region, falling back:", e.message);
        region = {
          id: DEFAULT_REGION_ID,
          currency_code: "USD",
          name: "Default Region",
        };
      }
    }
  } else {
    const fetched = await getRegion(countryCode!);
    region =
      fetched ?? {
        id: DEFAULT_REGION_ID,
        currency_code: "USD",
        name: "Default Region",
      };
  }

  const limit = queryParams.limit ?? 12;
  const offset = (pageParam - 1) * limit;
  const defaultFields =
    "*variants.calculated_price,*variants.prices,*variants.options,+variants.inventory_quantity,+variants.allow_backorder,+variants.manage_inventory,+metadata,+tags";
  const fields = queryParams.fields ?? defaultFields;

  const query: Record<string, any> = {
    limit,
    offset,
    region_id: region.id,
    ...queryParams,
    fields,
  };

  if (Array.isArray(query.tag_id)) {
    const ids = await Promise.all(
      query.tag_id.map(async (t: string) => await getTagIdByValue(t))
    );
    const valid = ids.filter(Boolean);
    if (valid.length) query["tag_id[]"] = valid;
    delete query.tag_id;
  }
  if (Array.isArray(query.id)) {
    query["id[]"] = query.id;
    delete query.id;
  }

  try {
    const response = await sdk.store.product.list(query, {
      next: { tags: ["products"] },
      cache: "no-store",
    });

    const { products, count } = response;

    // console.log("listProducts inventory:", {
    //   count,
    //   products: products.map((p) => ({
    //     id: p.id,
    //     title: p.title,
    //     variants: p.variants
    //       ? p.variants.map((v) => ({
    //           id: v.id,
    //           inventory_quantity: v.inventory_quantity,
    //           manage_inventory: v.manage_inventory,
    //           allow_backorder: v.allow_backorder,
    //         }))
    //       : "No variants available",
    //   })),
    // });

    if (
      !products.every((p) =>
        p.variants ? p.variants.every((v) => typeof v.inventory_quantity === "number") : true
      )
    ) {
      console.warn("Some products or variants are missing inventory_quantity");
    }

    return {
      response: { products, count },
      nextPage: count > offset + limit ? pageParam + 1 : null,
      queryParams,
    };
  } catch (e: any) {
    console.error("listProducts failed:", { query, error: e.message });
    return { response: { products: [], count: 0 }, nextPage: null, queryParams };
  }
}

/**
 * Fetches and sorts products with pagination.
 */
export async function listProductsWithSort(
  opts: {
    page?: number;
    queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
    sortBy?: SortOptions;
    countryCode: string;
  }
): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: typeof opts.queryParams;
}> {
  const page = opts.page ?? 1;
  const limit = opts.queryParams?.limit ?? 12;

  const {
    response: { products: all, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: { ...opts.queryParams, limit: 100 },
    countryCode: opts.countryCode,
  });

  const sorted = sortProducts(all, opts.sortBy ?? "created_at");
  const start = (page - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  return {
    response: { products: paginated, count },
    nextPage: count > page * limit ? page + 1 : null,
    queryParams: opts.queryParams,
  };
}