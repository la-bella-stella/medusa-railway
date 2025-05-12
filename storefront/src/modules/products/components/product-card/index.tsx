"use client";

import cn from "classnames";
import Image from "next/image";
import { FC, useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import ProductPrice from "@modules/products/components/product-price";
import { StoreProductWithTags, StoreVariantWithPrices } from "../../../../types/global";

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

  // Ensure region has a default value if null
  const effectiveRegion: HttpTypes.StoreRegion = region ?? {
    id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8",
    currency_code: "USD",
    name: "Default Region",
  };

  // Transform product to match StoreProductWithTags type
  const productForPrice: StoreProductWithTags = {
    ...product,
    tags: product.tags === null ? undefined : product.tags,
  };
  
  const inventoryQuantity = productForPrice.variants?.reduce(
    (total, variant) => total + (variant.inventory_quantity ?? 0),
    0
  ) ?? 0;

  const [imgError, setImgError] = useState(false);

  const brandName = product.collection?.title;

  // Calculate discount percentage for the sale label (similar to ProductPrice logic)
  const priceData = ((): { price_type: string; percentage_diff: string } | undefined => {
    let priceAmount: number | undefined;
    let msrp: number | undefined;
    let isSale = false;
    let discountPercentage: string | undefined;

    const all = productForPrice.variants ?? [];
    const priced = all.filter(
      (v): v is StoreVariantWithPrices & { prices: any[] } =>
        Array.isArray(v.prices) && v.prices.length > 0
    );
    if (!priced.length) return undefined;

    let cheapest: StoreVariantWithPrices | undefined;
    let lowestPrice = Number.MAX_SAFE_INTEGER;
    const currencyCode = effectiveRegion.currency_code ?? "USD";
    priced.forEach((v) => {
      const price = v.prices.find(
        (p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase()
      );
      if (price && price.amount < lowestPrice) {
        lowestPrice = price.amount;
        cheapest = v;
      }
    });

    if (!cheapest || !cheapest.prices) return undefined;

    const p = cheapest.prices.find(
      (price) => price.currency_code.toLowerCase() === currencyCode.toLowerCase()
    );
    if (!p) return undefined;

    priceAmount = p.amount; // Amount in dollars
    msrp = (cheapest.metadata as any)?.msrp !== undefined ? (cheapest.metadata as any).msrp : undefined;

    if (priceAmount !== undefined && msrp !== undefined && priceAmount < msrp) {
      isSale = true;
      const pct = ((msrp - priceAmount) / msrp) * 100;
      discountPercentage = Math.round(pct).toString();
    } else if (
      priceAmount !== undefined &&
      productForPrice.tags?.some((t) => t.value.includes("SALE"))
    ) {
      const saleTag = productForPrice.tags.find((t) => t.value.match(/SALE(\d+)/));
      const m = saleTag?.value.match(/SALE(\d+)/);
      if (m) {
        isSale = true;
        discountPercentage = m[1];
      }
    }

    if (priceAmount === undefined) return undefined;

    return {
      price_type: isSale ? "sale" : "default",
      percentage_diff: discountPercentage ?? "",
    };
  })();

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={cn(
        "group bg-white cursor-pointer overflow-hidden rounded-md transition duration-200 ease-in hover:shadow-product hover:-translate-y-1 card--product flex flex-col h-full",
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
          style={{ objectFit: "contain" }}
          className="rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={() => setImgError(true)}
          sizes="(min-width: 2108px) calc((1980px - 72px) / 4), (min-width: 1280px) calc((100vw - 200px) / 4), (min-width: 769px) calc((100vw - 136px) / 4), (min-width: 600px) calc((100vw - 112px) / 3), calc(100vw - 40px)"
        />
        <noscript>
          <img
            src={`${product.thumbnail}?width=460`}
            loading={imgLoading}
            className="img-fit img-fit--contain card__main-image"
            width="900"
            height="900"
            alt={product.title || t("text-product-image", "Product Image")}
          />
        </noscript>

        {/* Hover Image (using the first additional image if available) */}
        {product.images && product.images.length > 1 && (
          <>
            <Image
              src={product.images[1].url}
              alt={product.title || t("text-product-image", "Product Image")}
              fill
              loading={imgLoading}
              quality={100}
              style={{ objectFit: "contain" }}
              className="rounded-md transition-transform duration-300 ease-in-out opacity-0 group-hover:opacity-100"
              sizes="(min-width: 2108px) calc((1980px - 72px) / 4), (min-width: 1280px) calc((100vw - 200px) / 4), (min-width: 769px) calc((100vw - 136px) / 4), (min-width: 600px) calc((100vw - 112px) / 3), calc(100vw - 40px)"
            />
            <noscript>
              <img
                src={`${product.images[1].url}?width=460`}
                loading={imgLoading}
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

        {inventoryQuantity === 0 && (
          <span className="absolute top-1 start-0 text-xs text-white bg-gray-600 px-2 py-1 rounded-md">
            {t("text-out-stock", "Out of Stock")}
          </span>
        )}
      </div>

      <div className="card__info-container px-3 py-2 flex flex-col w-full min-h-[100px]">
        <div className="card__info-inner flex flex-col h-full w-full min-h-[100px]">
          <div className="flex flex-col">
            {/* Dedicated row for brand name, always takes space */}
            <div className="h-5">
              {brandName && (
                <p className="mb-0 text-sm text-gray-500 opacity-70 truncate w-full">
                  {brandName}
                </p>
              )}
            </div>

            {/* Title row, now pushed below the brand row */}
            <p className="font-bold mb-0 text-sm line-clamp-2">
              <span className="text-current">
                {product.title}
              </span>
            </p>

            {/* Product type row, if present */}
            {product.type?.value && (
              <p className="mt-1 mb-0 text-sm text-gray-500 opacity-70 truncate w-full">
                {product.type.value}
              </p>
            )}
          </div>

          <div className="flex-grow flex items-end">
            <div className={cn("inline-flex items-center space-x-2", { "text-red-500": priceData?.price_type === "sale" })}>
              <ProductPrice product={productForPrice} region={effectiveRegion} />
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default ProductCard;