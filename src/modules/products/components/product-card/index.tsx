"use client";

import cn from "classnames";
import Image from "next/image";
import { FC, useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getProductPrice } from "@lib/util/get-product-price";

interface Brand {
  id: string;
  name: string;
}

interface ProductProps {
  product: HttpTypes.StoreProduct & { brand?: Brand };
  className?: string;
  imageContentClassName?: string;
  variant?: "grid" | "gridSlim" | "list" | "gridModern";
  imgLoading?: "eager" | "lazy";
  region?: HttpTypes.StoreRegion | null;
}

const ProductCard: FC<ProductProps> = ({
  product,
  className = "",
  imageContentClassName = "",
  variant = "gridModern",
  imgLoading = "lazy",
  region = null,
}) => {
  const { t } = useTranslation("common");
  const { cheapestPrice } = getProductPrice({ product, region });

  if (!cheapestPrice) {
    console.warn("No cheapestPrice for product:", {
      id: product.id,
      regionId: region?.id,
      variants: product.variants?.length,
    });
  }

  const {
    calculated_price: currentPrice = "Price Unavailable",
    original_price: maybeBase,
    price_type,
    percentage_diff: discount,
  } = cheapestPrice || {};

  const basePrice = maybeBase || currentPrice;
  const isOnSale = price_type === "sale";
  const isVariable = (product.variants?.length ?? 0) > 1;

  const inventoryQuantity = product.variants?.reduce(
    (total, variant) => total + (variant.inventory_quantity ?? 0),
    0
  ) ?? 0;

  const [imgError, setImgError] = useState(false);

  const brandName = product.brand?.name;

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={cn(
        "group bg-white cursor-pointer overflow-hidden rounded-md transition duration-200 ease-in hover:shadow-product hover:-translate-y-1",
        className
      )}
      role="button"
      title={product.title}
    >
      <div
        className={cn(
          "relative w-full aspect-[3/4] overflow-hidden",
          imageContentClassName
        )}
      >
        <Image
          src={
            imgError || !product.thumbnail
              ? "/assets/placeholder/collection.svg"
              : product.thumbnail
          }
          alt={product.title || t("text-product-image", "Product Image")}
          fill
          loading={imgLoading}
          quality={100}
          style={{ objectFit: "cover" }}
          className="rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {isOnSale && discount && (
          <span className="absolute top-3 start-3 bg-red-500 text-white text-[11px] px-2.5 py-1.5 rounded-md leading-tight font-semibold">
            {discount} {t("text-off", "off")}
          </span>
        )}
        {inventoryQuantity === 0 && (
          <span className="absolute top-3 end-3 text-xs text-white bg-gray-600 px-2 py-1 rounded-md">
            {t("text-out-stock", "Out of Stock")}
          </span>
        )}
      </div>

      <div className="px-3 py-3 flex flex-col flex-grow w-full">
        {brandName && (
          <div className="text-xs text-gray-500 uppercase mb-1 truncate w-full">
            {brandName}
          </div>
        )}

        {product.type?.value && (
          <div className="text-xs text-gray-500 uppercase mb-1 truncate w-full">
            {product.type.value}
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-800 truncate mb-1.5 w-full">
          {product.title}
        </h3>

        <div className="mt-2 flex items-center space-x-2 w-full">
          {isVariable && (
            <span className="text-sm font-bold text-gray-800 uppercase">
              {t("text-from", "From")}
            </span>
          )}
          <span
            className={cn(
              "text-base font-semibold",
              isOnSale ? "text-red-500" : "text-gray-800"
            )}
          >
            {currentPrice}
          </span>
          {isOnSale && maybeBase && (
            <del className="text-sm text-gray-400 font-normal">
              {basePrice}
            </del>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default ProductCard;