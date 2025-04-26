// components/ProductPreview.tsx
"use client";

import React, { useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";
import { getProductPrice } from "@lib/util/get-product-price";
import { useTranslation } from "react-i18next";
import PreviewPrice from "./price";

interface ProductPreviewProps {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  countryCode?: string;
  className?: string;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  product,
  region,
  countryCode,
  className = "",
}) => {
  const { t } = useTranslation("common");
  const { cheapestPrice } = getProductPrice({ product, region });
  const [imgError, setImgError] = useState(false);

  // try your Medusa thumbnail, then first image URL, then placeholder
  const thumbnail =
    product.thumbnail ??
    product.images?.[0]?.url ??
    "/assets/placeholder/product-preview.svg";

  // ensure brand is a string
  const brand = String(product.metadata?.brand || "");

  const isVariable = (product.variants ?? []).length > 1;
  const isOnSale = cheapestPrice?.price_type === "sale";
  const basePath = countryCode ? `/${countryCode}` : "";

  return (
    <LocalizedClientLink
      href={`${basePath}/products/${product.handle}`}
      className={`group block w-full cursor-pointer transition ease-in-out duration-200 ${className}`}
      title={product.title}
    >
      {/* 3:4 card aspect + image covers fully */}
      <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden">
        <img
          src={imgError ? "/assets/placeholder/product-preview.svg" : thumbnail}
          alt={product.title || t("text-product-image", { defaultValue: "Product Image" })}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
        />
        {isOnSale && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            {t("text-sale", { defaultValue: "Sale" })}
          </span>
        )}
      </div>

      <div className="mt-4">
        {brand && (
          <div className="text-xs uppercase tracking-wider text-gray-500">
            {brand}
          </div>
        )}
        <h3 className="mt-1 text-sm font-medium text-gray-900 truncate">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center space-x-2">
          {isVariable && (
            <span className="text-sm font-semibold uppercase">
              {t("text-from", { defaultValue: "From" })}
            </span>
          )}
          {cheapestPrice ? (
            <PreviewPrice price={cheapestPrice} />
          ) : (
            <span className="text-sm font-medium text-gray-900">
              {t("text-price-unavailable", { defaultValue: "Price unavailable" })}
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default ProductPreview;
