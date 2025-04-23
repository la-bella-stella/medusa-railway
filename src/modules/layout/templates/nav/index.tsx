// src/modules/layout/templates/nav/index.tsx
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
    console.log("Nav: Fetching regions...");
    regions = (await listRegions()) || [];
    console.log("Nav: Regions fetched:", regions);
  } catch (error) {
    console.error("Nav: Error fetching regions:", error);
  }

  try {
    console.log("Nav: Retrieving customer...");
    customer = await retrieveCustomer().catch(() => null);
    isAuthenticated = !!customer;
    console.log("Nav: Customer retrieved:", customer, "isAuthenticated:", isAuthenticated);
  } catch (error) {
    console.error("Nav: Error retrieving customer:", error);
  }

  try {
    console.log("Nav: Retrieving cart...");
    cart = await retrieveCart().catch(() => null);
    console.log("Nav: Cart retrieved:", cart);
  } catch (error) {
    console.error("Nav: Error retrieving cart:", error);
  }

  try {
    console.log("Nav: Selecting region...");
    region = regions[0]; // Assume the first region for simplicity
    console.log("Nav: Region selected:", region);
  } catch (error) {
    console.error("Nav: Error selecting region:", error);
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