"use client";

import React from "react";
import Link from "next/link";
import ProductPrice from "@modules/products/components/product-price";
import type {
  StoreProductWithTags,
  StoreVariantWithPrices,
} from "types/global";
import type { HttpTypes } from "@medusajs/types";

type ProductInfoProps = {
  product: StoreProductWithTags & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
  };
  variant?: StoreVariantWithPrices;
};

const ProductInfo: React.FC<ProductInfoProps> = ({ product, variant }) => {
  const size = variant?.options
    ?.find((o) => o.option_id?.toLowerCase().includes("size"))
    ?.value;

  const titleWithSize = size
    ? `${product.title} – Size ${size}`
    : product.title;

  return (
    <div className="flex flex-col gap-y-2">
      {product.brand?.name ? (
        <h1 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold hover:text-black mb-3.5">
          <Link
            href={`/brands/${product.brand.name
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="inline-block pe-1.5 transition hover:underline hover:text-heading last:pe-0"
          >
            {product.brand.name}
          </Link>
        </h1>
      ) : (
        <div className="mb-3.5" />
      )}
      <h2 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold hover:text-black mb-3.5">
        {titleWithSize}
      </h2>
      <div className="flex items-center mt-5">
        <ProductPrice product={product} variant={variant} />
      </div>
    </div>
  );
};

export default ProductInfo;