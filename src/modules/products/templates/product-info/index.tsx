// src/modules/products/templates/product-info.tsx
import React from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPrice from "@modules/products/components/product-price"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct & { 
    brand?: { name: string }
    type?: HttpTypes.StoreProductType | null
  }
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  // Safely access brand or type, without a fallback
  const brandName = product.brand?.name || product.type?.value || null

  return (
    <div>
      {brandName && (
        <h1 className="text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold text-heading hover:text-black mb-3.5">
          {brandName}
        </h1>
      )}
      <h2 className="text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold text-heading hover:text-black mb-3.5">
        {product.title}
      </h2>
      <ProductPrice product={product} variant={product.variants?.[0]} />
    </div>
  )
}

export default ProductInfo