// src/lib/util/get-product-price.ts
import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-precentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any, region?: HttpTypes.StoreRegion | null) => {
  if (!variant?.calculated_price?.calculated_amount) {
    // If calculated_price is not available, calculate it from prices
    if (!variant?.prices || !region) {
      return null
    }

    const regionPrice = variant.prices.find(
      (price: any) => price.currency_code === region.currency_code
    )

    if (!regionPrice) {
      console.warn(
        `No price found for currency ${region.currency_code} in variant ${variant.id}`
      )
      return null
    }

    const calculatedAmount = regionPrice.amount
    const originalAmount = regionPrice.amount // Assuming no discounts; adjust if needed

    return {
      calculated_price_number: calculatedAmount,
      calculated_price: convertToLocale({
        amount: calculatedAmount,
        currency_code: region.currency_code,
      }),
      original_price_number: originalAmount,
      original_price: convertToLocale({
        amount: originalAmount,
        currency_code: region.currency_code,
      }),
      currency_code: region.currency_code,
      price_type: "default", // Adjust if you have price list types
      percentage_diff: getPercentageDiff(originalAmount, calculatedAmount),
    }
  }

  // Validate currency code against region's currency code
  const expectedCurrencyCode = region?.currency_code || "USD"
  if (variant.calculated_price.currency_code !== expectedCurrencyCode) {
    console.warn(
      `Currency mismatch: Expected ${expectedCurrencyCode}, but variant has ${variant.calculated_price.currency_code}. Pricing may not respect the region.`
    )
  }

  return {
    calculated_price_number: variant.calculated_price.calculated_amount,
    calculated_price: convertToLocale({
      amount: variant.calculated_price.calculated_amount,
      currency_code: variant.calculated_price.currency_code,
    }),
    original_price_number: variant.calculated_price.original_amount,
    original_price: convertToLocale({
      amount: variant.calculated_price.original_amount,
      currency_code: variant.calculated_price.currency_code,
    }),
    currency_code: variant.calculated_price.currency_code,
    price_type: variant.calculated_price.calculated_price.price_list_type,
    percentage_diff: getPercentageDiff(
      variant.calculated_price.original_amount,
      variant.calculated_price.calculated_amount
    ),
  }
}

export function getProductPrice({
  product,
  variantId,
  region,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
  region?: HttpTypes.StoreRegion | null
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant: any = product.variants
      .filter((v: any) => !!v.calculated_price || (v.prices && v.prices.length > 0))
      .sort((a: any, b: any) => {
        const aPrice = a.calculated_price?.calculated_amount || a.prices?.find(
          (p: any) => p.currency_code === region?.currency_code
        )?.amount || Infinity
        const bPrice = b.calculated_price?.calculated_amount || b.prices?.find(
          (p: any) => p.currency_code === region?.currency_code
        )?.amount || Infinity
        return aPrice - bPrice
      })[0]

    return getPricesForVariant(cheapestVariant, region)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant, region)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}