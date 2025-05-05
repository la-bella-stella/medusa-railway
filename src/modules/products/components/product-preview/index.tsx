"use client";

import React, { useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";
import { getProductPrice } from "@lib/util/get-product-price";
import { useTranslation } from "react-i18next";
import ProductPrice from "@modules/products/components/product-price";
import Image from "next/image";
import cn from "classnames";

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

  // Transform product to match StoreProductWithTags for ProductPrice compatibility
  const productForPrice = {
    ...product,
    tags: product.tags === null ? undefined : product.tags,
  };

  // Calculate inventory quantity for out-of-stock label
  const inventoryQuantity = product.variants?.reduce(
    (total, variant) => total + (variant.inventory_quantity ?? 0),
    0
  ) ?? 0;

  // Calculate sale percentage for label (mimicking ProductCard logic)
  const priceData = (() => {
    if (!cheapestPrice) return undefined;
    const priceAmount = parseFloat(cheapestPrice.calculated_price); // Convert string to number
    const msrp = parseFloat(cheapestPrice.original_price); // Convert string to number
    let isSale = cheapestPrice.price_type === "sale";
    let discountPercentage: string | undefined;

    if (
      !isNaN(priceAmount) &&
      !isNaN(msrp) &&
      priceAmount !== undefined &&
      msrp !== undefined &&
      priceAmount < msrp
    ) {
      isSale = true;
      const pct = ((msrp - priceAmount) / msrp) * 100;
      discountPercentage = Math.round(pct).toString();
    } else if (productForPrice.tags?.some((t) => t.value.includes("SALE"))) {
      const saleTag = productForPrice.tags.find((t) => t.value.match(/SALE(\d+)/));
      const m = saleTag?.value.match(/SALE(\d+)/);
      if (m) {
        isSale = true;
        discountPercentage = m[1];
      }
    }

    return {
      price_type: isSale ? "sale" : "default",
      percentage_diff: discountPercentage ?? "",
    };
  })();

  // Use collection title as brand, like ProductCard
  const brandName = product.collection?.title;
  const isVariable = (product.variants ?? []).length > 1;
  const basePath = countryCode ? `/${countryCode}` : "";

  return (
    <LocalizedClientLink
      href={`${basePath}/products/${product.handle}`}
      className={cn(
        "group bg-white cursor-pointer overflow-hidden rounded-md transition duration-200 ease-in hover:shadow-product hover:-translate-y-1 flex flex-col h-full card--product",
        className
      )}
      role="button"
      title={product.title}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <Image
          src={
            imgError || !product.thumbnail
              ? "/assets/placeholder/collection.svg"
              : product.thumbnail
          }
          alt={product.title || t("text-product-image", "Product Image")}
          fill
          loading="lazy"
          quality={100}
          style={{ objectFit: "contain" }}
          className="rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={() => setImgError(true)}
          sizes="(min-width: 2108px) calc((1980px - 72px) / 4), (min-width: 1280px) calc((100vw - 200px) / 4), (min-width: 769px) calc((100vw - 136px) / 4), (min-width: 600px) calc((100vw - 112px) / 3), calc(100vw - 40px)"
        />
        <noscript>
          <img
            src={`${product.thumbnail}?width=460`}
            loading="lazy"
            className="img-fit img-fit--contain card__main-image"
            width="900"
            height="900"
            alt={product.title || t("text-product-image", "Product Image")}
          />
        </noscript>

        {/* Hover Image */}
        {product.images && product.images.length > 1 && (
          <>
            <Image
              src={product.images[1].url}
              alt={product.title || t("text-product-image", "Product Image")}
              fill
              loading="lazy"
              quality={100}
              style={{ objectFit: "contain" }}
              className="rounded-md transition-transform duration-300 ease-in-out opacity-0 group-hover:opacity-100"
              sizes="(min-width: 2108px) calc((1980px - 72px) / 4), (min-width: 1280px) calc((100vw - 200px) / 4), (min-width: 769px) calc((100vw - 136px) / 4), (min-width: 600px) calc((100vw - 112px) / 3), calc(100vw - 40px)"
            />
            <noscript>
              <img
                src={`${product.images[1].url}?width=460`}
                loading="lazy"
                className="img-fit img-fit--contain card__hover-image"
                width="900"
                height="900"
                alt={product.title || t("text-product-image", "Product Image")}
              />
            </noscript>
          </>
        )}

        {/* Sale Label */}
        {priceData?.price_type === "sale" && priceData.percentage_diff && (
          <div className="absolute top-1 end-0">
            <div className="flex justify-end">
              <span className="flex items-center bg-red-500 text-white text-[11px] px-2.5 py-1.5 rounded-md leading-tight font-semibold">
                <svg
                  className="mr-1"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                  role="presentation"
                >
                  <path
                    fill="currentColor"
                    d="M7.59 1.34a1 1 0 01.7-.29h5.66a1 1 0 011 1v5.66a1 1 0 01-.3.7L7.6 15.5a1 1 0 01-1.42 0L.52 9.83a1 1 0 010-1.42l7.07-7.07zm6.36 6.37l-7.07 7.07-5.66-5.66L8.3 2.05h5.66v5.66z"
                    fillRule="evenodd"
                  />
                  <path
                    fill="currentColor"
                    d="M9.7 6.3a1 1 0 101.42-1.42 1 1 0 00-1.41 1.41zM9 7a2 2 0 102.83-2.83A2 2 0 009 7z"
                    fillRule="evenodd"
                  />
                </svg>
                {priceData.percentage_diff}% off
              </span>
            </div>
          </div>
        )}

        {/* Out of Stock Label */}
        {inventoryQuantity === 0 && (
          <span className="absolute top-1 start-0 text-xs text-white bg-gray-600 px-2 py-1 rounded-md">
            {t("text-out-stock", "Out of Stock")}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="card__info-container px-3 py-2 flex flex-col flex-1 w-full min-h-[100px]">
        <div className="card__info-inner flex flex-col h-full w-full min-h-[100px]">
          <div className="flex flex-col">
            {/* Brand Row */}
            <div className="h-5">
              {brandName && (
                <p className="card__vendor mb-0 text-sm text-gray-500/70 truncate w-full">
                  {brandName}
                </p>
              )}
            </div>

            {/* Title Row */}
            <p className="card__title font-bold mt-1 mb-0 text-sm line-clamp-2">
              <span className="card-link text-current">{product.title}</span>
            </p>

            {/* Product Type Row */}
            {product.type?.value && (
              <p className="mt-1 mb-0 text-sm text-gray-500/70 truncate w-full">
                {product.type.value}
              </p>
            )}
          </div>

          {/* Price Row */}
          <div className="flex-grow flex items-end">
            <div
              className={cn("inline-flex items-center space-x-2", {
                "text-red-500": priceData?.price_type === "sale",
              })}
            >
              {isVariable && (
                <span className="text-sm font-semibold uppercase">
                  {t("text-from", { defaultValue: "From" })}
                </span>
              )}
              <div className="[&_[data-testid='product-price']]:text-sm [&_[data-testid='product-price']]:!font-normal [&_[data-testid='original-product-price']]:text-sm [&_[data-testid='original-product-price']]:line-through [&_[data-testid='original-product-price']]:text-gray-400">
                <ProductPrice product={productForPrice} region={region} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default ProductPreview;