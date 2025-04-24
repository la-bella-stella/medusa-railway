import { HttpTypes, StorePrice } from "@medusajs/types";

// Extend StoreProductParams and StoreCollectionParams
declare module "@medusajs/types" {
  interface StoreProductParams {
    tags?: string[];
    region_id?: string; // Already supported in products.ts
  }
  interface StoreCollectionParams {
    region_id?: string; // ← Add this
  }
}

export type FeaturedProduct = {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
};

export type VariantPrice = {
  calculated_price_number: number;
  calculated_price: string;
  original_price_number: number;
  original_price: string;
  currency_code: string;
  price_type: string;
  percentage_diff: string;
};

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean;
  target_remaining: number;
  remaining_percentage: number;
};