// src/components/ProductPrice.tsx

import { clx } from "@medusajs/ui"
import type {
  ProductPriceProps,
  VariantPrice,
  StoreVariantWithPrices,
  PriceEntry,
} from "../../../../types/global"

export default function ProductPrice({
  product,
  variant,
}: ProductPriceProps) {
  // format helper (amount is now already in dollars)
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)

  // compute price data without dividing by 100
  const getPriceData = (): VariantPrice | undefined => {
    let priceAmount: number | undefined
    let currencyCode = "USD"
    let msrp: number | undefined
    let isSale = false
    let discountPercentage: string | undefined

    if (variant?.prices?.length) {
      const p = variant.prices[0]
      priceAmount = p.amount    // no more /100
      currencyCode = p.currency_code
      msrp =
        variant.metadata?.msrp !== undefined
          ? variant.metadata.msrp
          : undefined
    } else {
      const all = product.variants ?? []
      const priced = all.filter(
        (v): v is StoreVariantWithPrices & { prices: PriceEntry[] } =>
          Array.isArray(v.prices) && v.prices.length > 0
      )
      if (!priced.length) return undefined

      let cheapest = priced[0]
      priced.forEach((v) => {
        if (v.prices[0].amount < cheapest.prices[0].amount) {
          cheapest = v
        }
      })

      priceAmount = cheapest.prices[0].amount
      currencyCode = cheapest.prices[0].currency_code
      msrp =
        cheapest.metadata?.msrp !== undefined
          ? cheapest.metadata.msrp
          : undefined
    }

    // sale logic
    if (
      priceAmount !== undefined &&
      msrp !== undefined &&
      priceAmount < msrp
    ) {
      isSale = true
      const pct = ((msrp - priceAmount) / msrp) * 100
      discountPercentage = Math.round(pct).toString()
    } else if (
      priceAmount !== undefined &&
      product.tags?.some((t) => t.value.includes("SALE"))
    ) {
      const saleTag = product.tags.find((t) =>
        t.value.match(/SALE(\d+)/)
      )
      const m = saleTag?.value.match(/SALE(\d+)/)
      if (m) {
        isSale = true
        discountPercentage = m[1]
        msrp = priceAmount / (1 - parseInt(m[1], 10) / 100)
      }
    }

    if (priceAmount === undefined) return undefined

    return {
      calculated_price: formatPrice(priceAmount, currencyCode),
      original_price: msrp ? formatPrice(msrp, currencyCode) : "",
      price_type: isSale ? "sale" : "default",
      percentage_diff: discountPercentage ?? "",
      calculated_price_number: priceAmount,
      original_price_number: msrp ?? 0,
      currency_code: currencyCode,
    }
  }

  const data = getPriceData()
  if (!data) {
    return (
      <div className="text-gray-500 text-base font-semibold">
        Price unavailable
      </div>
    )
  }

  return (
    <div className="flex items-center mt-5 space-x-2">
      {/* Current price */}
      <div
        className={clx(
          "text-base font-semibold md:text-xl lg:text-2xl",
          data.price_type === "sale"
            ? "text-red-500"
            : "text-gray-900"
        )}
        data-testid="product-price"
        data-value={data.calculated_price_number}
      >
        {data.calculated_price}
      </div>

      {/* Original price, only on sale */}
      {data.price_type === "sale" && data.original_price && (
        <del
          className="font-segoe line-through text-gray-400 text-sm md:text-lg"
          data-testid="original-product-price"
          data-value={data.original_price_number}
        >
          {data.original_price}
        </del>
      )}
    </div>
  )
}
