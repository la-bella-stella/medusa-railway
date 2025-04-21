// src/modules/products/components/product-card/index.tsx
import cn from "classnames";
import Image from "next/image";
import { FC, useState } from "react";
import { StoreProduct } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getProductPrice } from "@lib/util/get-product-price";

interface ProductProps {
  product: StoreProduct;
  className?: string;
  imageContentClassName?: string;
  variant?: "grid" | "gridSlim" | "list" | "gridModern";
  imgLoading?: "eager" | "lazy";
}

const ProductCard: FC<ProductProps> = ({
  product,
  className = "",
  imageContentClassName = "",
  variant = "gridModern",
  imgLoading = "lazy",
}) => {
  const { t } = useTranslation("common");
  const {
    title,
    thumbnail,
    variants,
    type,
    handle,
  } = product;

  // Use getProductPrice to handle pricing
  const { cheapestPrice } = getProductPrice({ product });

  const selectedPrice = cheapestPrice;

  if (!selectedPrice) {
    return (
      <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
    );
  }

  const currentPrice = selectedPrice.calculated_price;
  const basePrice = selectedPrice.original_price || selectedPrice.calculated_price;
  const isOnSale = selectedPrice.price_type === "sale";
  const discount = selectedPrice.percentage_diff;

  const isVariable = variants ? variants.length > 1 : false;
  const hasRange = false; // We'll add range logic later if needed

  // Check inventory quantity from the first variant
  const inventoryQuantity = variants?.[0]?.inventory_quantity ?? 0;

  const [imgError, setImgError] = useState(false);

  return (
    <LocalizedClientLink
      href={`/products/${handle}`}
      className={cn(
        "group bg-white cursor-pointer overflow-hidden rounded-md transition duration-200 ease-in hover:shadow-product hover:-translate-y-1",
        className
      )}
      role="button"
      title={title}
    >
      <div
        className={cn(
          "relative w-full aspect-[3/4] overflow-hidden",
          imageContentClassName
        )}
      >
        <Image
          src={
            imgError
              ? "/assets/placeholder/collection.svg"
              : thumbnail ?? "/assets/placeholder/collection.svg"
          }
          fill
          loading={imgLoading}
          quality={100}
          alt={title || t("text-product-image")}
          className="object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {isOnSale && discount && (
          <span className="absolute top-3 start-3 bg-red-500 text-white text-[11px] px-2.5 py-1.5 rounded-md leading-tight font-semibold">
            {discount} {t("text-off")}
          </span>
        )}

        {inventoryQuantity === 0 && (
          <span className="absolute top-3 end-3 text-xs text-white bg-heading px-2 py-1 rounded-md">
            {t("text-out-stock")}
          </span>
        )}
      </div>

      <div className="px-3 py-3">
        {type?.value && (
          <div className="text-xs text-gray-500 uppercase mb-1 truncate">
            {type.value}
          </div>
        )}
        <h3 className="text-sm font-semibold text-heading truncate mb-1.5">
          {title}
        </h3>

        <div className="text-sm font-semibold mt-2 flex items-center space-x-2">
          {isVariable && hasRange && (
            <span className="text-sm font-bold text-heading uppercase">
              {t("text-from")}
            </span>
          )}
          <span
            className={cn(
              "text-base font-semibold",
              isOnSale ? "text-red-500" : "text-heading"
            )}
          >
            {currentPrice}
          </span>
          {isOnSale && (
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