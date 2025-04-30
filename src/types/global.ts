import { HttpTypes, StorePrice } from "@medusajs/types";

// Extend Medusa types
declare module "@medusajs/types" {
  // Extend StoreProductParams to include tags
  interface StoreProductParams {
    tags?: string[];
  }

  // Extend StoreProductVariant to include prices
  interface StoreProductVariant {
    prices?: Array<{
      id: string;
      currency_code: string;
      amount: number;
      price_set_id?: string;
      created_at?: string;
      updated_at?: string;
      deleted_at?: string | null;
      min_quantity?: number | null;
      max_quantity?: number | null;
      price_list_id?: string | null;
      price_list?: any | null;
      rules_count?: number;
      title?: string | null;
      raw_amount?: { value: string; precision: number };
    }>;
  }
}

// Custom types
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

export type StoreProductWithTags = HttpTypes.StoreProduct & {
  tags?: Array<HttpTypes.StoreProductTag>;
  variants: HttpTypes.StoreProductVariant[] | null;
};

export type ProductPriceProps = {
  product: HttpTypes.StoreProduct;
  variant?: HttpTypes.StoreProductVariant;
  region?: HttpTypes.StoreRegion;
};

export type StoreVariantWithPrices = HttpTypes.StoreProductVariant & {
  prices: PriceEntry[];
  metadata?: { msrp?: number };
};

export type PriceEntry = {
  id: string;
  currency_code: string;
  amount: number;
  price_set_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  price_list_id?: string | null;
  price_list?: any | null;
  rules_count?: number;
  title?: string | null;
  raw_amount?: { value: string; precision: number };
};