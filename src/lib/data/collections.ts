import { sdk } from "@lib/config";
import { HttpTypes } from "@medusajs/types";
import { getCacheOptions } from "./cookies";

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  };

  try {
    return sdk.client
      .fetch<{ collection: HttpTypes.StoreCollection }>(
        `/store/collections/${id}`,
        {
          next,
          cache: "force-cache",
        }
      )
      .then(({ collection }) => collection);
  } catch (e: any) {
    throw new Error(
      `Failed to fetch collection: ${e.message || "Unknown error"}. Status: ${e.response?.status || "N/A"}. Details: ${JSON.stringify(e.response?.data || {})}`
    );
  }
};

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  };

  queryParams.limit = queryParams.limit || "100";
  queryParams.offset = queryParams.offset || "0";

  console.log("listCollections called with params:", queryParams, new Error().stack);

  try {
    return sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
        "/store/collections",
        {
          query: queryParams,
          next,
          cache: "force-cache",
        }
      )
      .then(({ collections }) => ({ collections, count: collections.length }));
  } catch (e: any) {
    throw new Error(
      `Failed to fetch collections: ${e.message || "Unknown error"}. Status: ${e.response?.status || "N/A"}. Details: ${JSON.stringify(e.response?.data || {})}`
    );
  }
};

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  };

  console.log("getCollectionByHandle called with handle:", handle);

  try {
    return sdk.client
      .fetch<HttpTypes.StoreCollectionListResponse>("/store/collections", {
        query: { handle, fields: "*products" },
        next,
        cache: "force-cache",
      })
      .then(({ collections }) => {
        if (!collections[0]) {
          throw new Error(`Collection with handle ${handle} not found`);
        }
        return collections[0];
      });
  } catch (e: any) {
    throw new Error(
      `Failed to fetch collection by handle: ${e.message || "Unknown error"}. Status: ${e.response?.status || "N/A"}. Details: ${JSON.stringify(e.response?.data || {})}`
    );
  }
};