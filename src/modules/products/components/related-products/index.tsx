// src/modules/products/components/related-products/index.tsx
"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "../product-preview"
import { useTranslation } from "react-i18next"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion | null
  countryCode: string
  relatedProducts?: HttpTypes.StoreProduct[]
  sectionHeading?: string // Add sectionHeading prop
}

export default function RelatedProducts({
  product,
  region,
  countryCode,
  relatedProducts = [],
  sectionHeading = "text-related-products", // Default to the translation key
}: RelatedProductsProps) {
  const { t } = useTranslation()

  if (!region || !relatedProducts.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col mb-16">
        <span className="text-lg font-semibold text-heading mb-6">
          {t(sectionHeading)} {/* Use translation for the heading */}
        </span>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-8">
        {relatedProducts.map((relatedProduct) => (
          <li key={relatedProduct.id}>
            <ProductPreview product={relatedProduct} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}