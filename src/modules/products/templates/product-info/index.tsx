// src/modules/products/templates/product-info.tsx
import React from "react";
import { HttpTypes } from "@medusajs/types";
import ProductPrice from "@modules/products/components/product-price";

type ProductInfoProps = {
  product: HttpTypes.StoreProduct & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
  };
  variant?: HttpTypes.StoreProductVariant; // Add variant prop to reflect selected variant
};

const ProductInfo: React.FC<ProductInfoProps> = ({ product, variant }) => {
  // Combine brand and product title, append variant size if available
  const size = variant?.options?.find((opt) => opt.option_id?.includes("size"))?.value;
  const title = `${product.brand?.name || ""} ${product.title}${size ? ` - Size ${size}` : ""}`.trim();

  return (
    <div>
      <h1 className="text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold uppercase">
        {title}
      </h1>
      <div className="flex items-center mt-5">
        <ProductPrice product={product} variant={variant} />
      </div>
    </div>
  );
};

export default ProductInfo;