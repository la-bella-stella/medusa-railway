"use client";

import React from "react";
import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";
import isEmpty from "lodash/isEmpty";
import { getPricesForVariant } from "@lib/util/get-product-price"; // Added import

type SearchProductProps = {
  item: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion | null;
  countryCode: string;
};

const SearchProduct: React.FC<SearchProductProps> = ({ item, region, countryCode }) => {
  // Calculate min and max prices from variants using getPricesForVariant
  const prices = item.variants?.map((variant) => {
    const priceData = getPricesForVariant(variant, region);
    return priceData ? priceData.calculated_price_number : Infinity;
  }) || [];
  const minPrice = Math.min(...prices.filter((p) => p !== Infinity)) || 0;
  const maxPrice = Math.max(...prices.filter((p) => p !== Infinity)) || 0;
  const hasVariants = minPrice !== maxPrice;

  // Get the currency code from the first variant with a price, fallback to region
  const currencyCode = item.variants?.find((v) => {
    const priceData = getPricesForVariant(v, region);
    return priceData?.calculated_price_number !== undefined;
  })?.calculated_price?.currency_code?.toUpperCase() || region?.currency_code?.toUpperCase() || "USD";

  // Get the thumbnail or fallback image
  const thumbnail = item.thumbnail || "/assets/placeholder/search-product.svg";

  return (
    <LocalizedClientLink
      href={`/${countryCode}/products/${item.handle}`}
      className="group w-full h-auto flex justify-start items-center"
    >
      <div className="relative flex w-16 md:w-24 h-16 md:h-24 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer ltr:mr-4 rtl:ml-4">
        <Image
          src={thumbnail}
          width={96}
          height={96}
          loading="eager"
          alt={item.title || "Product Image"}
          className="bg-gray-200 object-cover"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <h3 className="truncate text-sm text-heading mb-2">{item.title}</h3>

        <div className="text-heading font-semibold text-sm">
          {hasVariants ? (
            <span>
              {currencyCode} {minPrice.toFixed(2)} - {maxPrice.toFixed(2)}
            </span>
          ) : (
            <span>
              {currencyCode} {minPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  );
};

export default SearchProduct;