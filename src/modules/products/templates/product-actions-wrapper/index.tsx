// src/modules/products/templates/product-actions-wrapper/index.tsx
"use client"

import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Renders the product actions component with pre-fetched product data.
 */
export default function ProductActionsWrapper({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct | null
  region: HttpTypes.StoreRegion
}) {
  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} />
}