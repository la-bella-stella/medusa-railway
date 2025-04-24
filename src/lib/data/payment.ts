// src/modules/common/actions/payment.ts
"use server";
import "server-only";

import { sdk } from "@lib/config";
import medusaError from "@lib/util/medusa-error";
import { cookies } from "next/headers";
import { getAuthHeaders, getCacheOptions } from "./cookies";
import { getRegion } from "./regions";
import { HttpTypes } from "@medusajs/types";

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

/**
 * List available payment providers for the user’s region.
 * - Reads NEXT_LOCALE from a cookie (falls back to DEFAULT_COUNTRY).
 * - Uses getRegion to resolve that to a region ID.
 * - Calls /store/payment-providers?region_id=<region.id>.
 */
export const listCartPaymentMethods = async (): Promise<
  HttpTypes.StorePaymentProvider[] | null
> => {
  // 1) Read NEXT_LOCALE cookie (or use default)
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? DEFAULT_COUNTRY;

  // 2) Resolve locale → region
  const region = await getRegion(locale);
  if (!region) {
    console.error(`listCartPaymentMethods: no region found for locale "${locale}"`);
    return null;
  }

  // 3) Prepare headers & cache options
  const headers = { ...(await getAuthHeaders()) };
  const next    = { ...(await getCacheOptions("payment_providers")) };

  // 4) Fetch payment providers scoped to region.id
  try {
    const { payment_providers } =
      await sdk.client.fetch<HttpTypes.StorePaymentProviderListResponse>(
        "/store/payment-providers",
        {
          method: "GET",
          query: { region_id: region.id },
          headers,
          next,
          cache: "force-cache",
        }
      );

    // 5) Sort by ID for consistent ordering
    return payment_providers.sort((a, b) =>
      a.id > b.id ? 1 : -1
    );
  } catch (err: any) {
    medusaError(err);
    return null;
  }
};
