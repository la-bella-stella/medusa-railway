"use server";
import "server-only";

import { sdk } from "@lib/config";
import medusaError from "@lib/util/medusa-error";
import { getCacheOptions } from "./cookies";
import { cookies } from "next/headers";
import { HttpTypes } from "@medusajs/types";

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

/**
 * Fetch all store regions.
 */
export const listRegions = async (): Promise<HttpTypes.StoreRegion[]> => {
  const next = { ...(await getCacheOptions("regions")) };

  try {
    const { regions } = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(
      `/store/regions`,
      {
        method: "GET",
        next,
        cache: "force-cache",
      }
    );
    return regions;
  } catch (err: any) {
    throw medusaError(err);
  }
};

/**
 * Fetch a single region by its ID.
 */
export const retrieveRegion = async (id: string): Promise<HttpTypes.StoreRegion> => {
  const next = { ...(await getCacheOptions(`regions-${id}`)) };

  try {
    const { region } = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      {
        method: "GET",
        next,
        cache: "force-cache",
      }
    );
    return region;
  } catch (err: any) {
    throw medusaError(err);
  }
};

// In‐memory cache of countryCode → region
const regionMap = new Map<string, HttpTypes.StoreRegion>();

/**
 * Resolve a region by country code.
 * If not provided, falls back to NEXT_LOCALE cookie or DEFAULT_COUNTRY.
 */
export const getRegion = async (
  countryCode?: string
): Promise<HttpTypes.StoreRegion | null> => {
  // 1) Pick code from argument, or cookie, or default
  let code = countryCode;
  if (!code) {
    const cookieStore = await cookies();
    code = cookieStore.get("NEXT_LOCALE")?.value ?? DEFAULT_COUNTRY;
  }

  // 2) Normalize to lowercase
  code = code.toLowerCase();

  // 3) Return from cache if we’ve already loaded it
  if (regionMap.has(code)) {
    return regionMap.get(code)!;
  }

  // 4) Otherwise fetch all regions and build the map
  let regions: HttpTypes.StoreRegion[];
  try {
    regions = await listRegions();
  } catch {
    return null;
  }

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      if (c.iso_2) {
        regionMap.set(c.iso_2.toLowerCase(), region);
      }
    });
  });

  // 5) Return whichever region matches the code (or null)
  return regionMap.get(code) ?? null;
};