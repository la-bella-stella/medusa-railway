// src/types/global.ts

import type { HttpTypes, StorePrice } from "@medusajs/types"

/**
 * A single region-aware price record.
 */
export interface PriceEntry extends StorePrice {
  min_quantity: number | null
  max_quantity: number | null
  rules: Record<string, any>
}

/**
 * Exactly the Medusa variant + our extras.
 */
export interface StoreVariantWithPrices
  extends HttpTypes.StoreProductVariant
{
  prices?: PriceEntry[]
  metadata?: { msrp?: number; [k: string]: any } | null
}

/**
 * The product you actually work with in <ProductPrice>:
 *  - tags become objects
 *  - variants become our extended StoreVariantWithPrices[]
 */
export interface StoreProductWithTags
  extends Omit<HttpTypes.StoreProduct, "tags" | "variants">
{
  tags?: Array<{ value: string }>
  variants?: StoreVariantWithPrices[] | null
}

/**
 * Props for your <ProductPrice> component
 */
export interface ProductPriceProps {
  product: StoreProductWithTags
  variant?: StoreVariantWithPrices
}

/**
 * The shape returned by getPriceData()
 */
export interface VariantPrice {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: "sale" | "default"
  percentage_diff: string
}

/* Optional helper types, left here in case you need them elsewhere */
export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

export interface Filters {
  category?: string[]
  brand?: string[]
  collection?: string[]
  grouped_color?: string[]
  gender?: string[]
  season?: string[]
  price?: string[]
  tags?: string[]
}
