import { listRegions } from "@lib/data/regions";
import { retrieveCustomer } from "@lib/data/customer";
import { retrieveCart } from "@lib/data/cart";
import { getRegion } from "@lib/data/regions";
import { StoreRegion } from "@medusajs/types";
import ClientNav from "./client-nav";
import { Suspense } from "react";

// Define props interface for Nav
interface NavProps {
  countryCode?: string;
}

export default async function Nav({ countryCode }: NavProps) {
  let regions: StoreRegion[] = [];
  let customer = null;
  let isAuthenticated = false;
  let cart = null;
  let region = null;

  try {
    regions = (await listRegions()) || [];
  } catch (error) {
    // Handle error silently
  }

  try {
    customer = await retrieveCustomer().catch(() => null);
    isAuthenticated = !!customer;
  } catch (error) {
    // Handle error silently
  }

  try {
    cart = await retrieveCart().catch(() => null);
  } catch (error) {
    // Handle error silently
  }

  try {
    region = regions[0]; // Assume the first region for simplicity
  } catch (error) {
    // Handle error silently
  }

  return (
    <Suspense fallback={<div>Loading navigation...</div>}>
      <ClientNav
        regions={regions}
        isAuthenticated={isAuthenticated}
        cart={cart}
        regionId={countryCode || region?.id || ""}
      />
    </Suspense>
  );
}