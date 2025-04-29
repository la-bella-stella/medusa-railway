"use client";

import cn from "classnames";
import Image from "next/image";
import { FC, useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import ProductPrice from "@modules/products/components/product-price";
import { StoreProductWithTags } from "../../../../types/global";

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
    tags: product.tags?.map((tag) => ({ value: tag.value })) ?? undefined,
  };

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
          "card__media has-hover-image relative",
          imageContentClassName
        )}
      >
        <div className="media block relative" style={{ paddingTop: "100%" }}>
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
            className="img-fit img-fit--contain card__main-image no-js-hidden rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(min-width: 2108px) calc((1980px - 72px) / 4), (min-width: 1280px) calc((100vw - 200px) / 4), (min-width: 769px) calc((100vw - 136px) / 4), (min-width: 600px) calc((100vw - 112px) / 3), calc(100vw - 40px)"
          />
          <noscript>
            <img
              src={`${product.thumbnail}?width=460`}
              loading={imgLoading}
              className="img-fit img-fit--contain card__main-image"
              width="900"
              height="1200"
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
                className="img-fit img-fit--contain card__hover-image no-js-hidden rounded-md transition-transform duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                sizes="(min-width: 2108px) calc((1980px - 72px) / 4), (min-width: 1280px) calc((100vw - 200px) / 4), (min-width: 769px) calc((100vw - 136px) / 4), (min-width: 600px) calc((100vw - 112px) / 3), calc(100vw - 40px)"
              />
              <noscript>
                <img
                  src={`${product.images[1].url}?width=460`}
                  loading={imgLoading}
                  className="img-fit img-fit--contain card__hover-image"
                  width="900"
                  height="1200"
                  alt={product.title || t("text-product-image", "Product Image")}
                />
              </noscript>
            </>
          )}
        </div>

        {inventoryQuantity === 0 && (
          <span className="absolute top-3 end-3 text-xs text-white bg-gray-600 px-2 py-1 rounded-md">
            {t("text-out-stock", "Out of Stock")}
          </span>
        )}
      </div>

      <div className="card__info px-3 py-3 flex flex-col flex-grow w-full">
        <div className="card__info-inner flex flex-col h-full w-full">
          {brandName && (
            <p className="card__vendor mb-0 text-sm text-gray-500 opacity-70">
              {brandName}
            </p>
          )}

          {product.type?.value && (
            <p className="card__vendor mb-0 text-sm text-gray-500 opacity-70">
              {product.type.value}
            </p>
          )}

          <p className="card__title font-bold mt-1 mb-0">
            <span className="card-link text-current js-prod-link">
              {product.title}
            </span>
          </p>

          <div className="flex grow items-end">
            <div className="price price--bottom">
              <ProductPrice product={productForPrice} region={effectiveRegion} />
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default ProductCard;