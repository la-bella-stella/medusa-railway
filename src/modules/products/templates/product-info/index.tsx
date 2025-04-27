// src/modules/products/templates/product-info.tsx
import React from "react";
import { HttpTypes } from "@medusajs/types";
import Link from "next/link";
import ProductPrice from "@modules/products/components/product-price";

type ProductInfoProps = {
  product: HttpTypes.StoreProduct & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
  };
  variant?: HttpTypes.StoreProductVariant;
};

const ProductInfo: React.FC<ProductInfoProps> = ({ product, variant }) => {
  // Determine the size from the variant options (if available)
  const size = variant?.options?.find((opt) => opt.option_id?.includes("size"))?.value;
  const titleWithSize = size ? `${product.title} - Size ${size}` : product.title;

  return (
    <div className="flex flex-col gap-y-2">
      {product.brand?.name && (
        <h1 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold uppercase hover:text-black">
          <Link
            href={`/brands/${product.brand.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="inline-block pe-1.5 transition hover:underline hover:text-heading last:pe-0"
          >
            {product.brand.name}
          </Link>
        </h1>
      )}
      <h2 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold uppercase hover:text-black mb-3.5">
        {titleWithSize}
      </h2>
      <div className="flex items-center mt-5 gap-x-2">
        <ProductPrice product={product} variant={variant} />
      </div>
    </div>
  );
};

export default ProductInfo;