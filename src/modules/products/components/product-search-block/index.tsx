// src/modules/products/components/product-search-block.tsx
"use client";

import React from "react";
import type { FC } from "react";
import { useProducts, InfiniteProductResponse } from "@lib/hooks/use-products";
import { HttpTypes } from "@medusajs/types";
import ProductInfiniteGrid from "@modules/products/components/product-infinite-grid";
import { useTranslation } from "react-i18next";
import FilterIcon from "@modules/common/icons/filter-icon";
import { useUI } from "@lib/context/ui-context";
import type { Filters } from "types/global";
import { UseInfiniteQueryResult } from "@tanstack/react-query";

const PRODUCT_LIMIT = 12;

interface ProductSearchBlockProps {
  region: HttpTypes.StoreRegion;
  countryCode: string;
  filters: Filters;
}

const ProductSearchBlock: FC<ProductSearchBlockProps> = ({
  region,
  countryCode,
  filters,
}) => {
  const { t } = useTranslation("common");
  const { openSidebar } = useUI();

  // Build the params object
  const params: Record<string, any> = {
    regionId: region.id,
    countryCode, // Pass countryCode
    limit: PRODUCT_LIMIT,
    infinite: true, // Enable infinite query
  };

  if (filters.category?.length) {
    params.category = filters.category.join(",");
  }
  if (filters.brand?.length) {
    params.brand = filters.brand.join(",");
  }
  if (filters.collection?.length) {
    params.collection = filters.collection.join(",");
  }
  if (filters.grouped_color?.length) {
    params.grouped_color = filters.grouped_color.join(",");
  }
  if (filters.gender?.length) {
    params.gender = filters.gender.join(",");
  }
  if (filters.season?.length) {
    params.season = filters.season.join(",");
  }
  if (filters.price?.length) {
    const [min, max] = filters.price[0].split("-").map((v) => v.trim());
    params.min_price = min;
    params.max_price = max;
  }

  const {
    isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
    isError,
  } = useProducts(params) as UseInfiniteQueryResult<InfiniteProductResponse, Error>;

  // Log detailed error information
  if (isError) {
    console.error("Product search error:", {
      message: error?.message,
      cause: error?.cause,
      stack: error?.stack,
      params,
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span>{t("text-loading", "Loading...")}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        {t("text-error-loading-products", "Failed to load products")}:{" "}
        {error?.message || t("text-unknown-error", "An unknown error occurred")}
      </div>
    );
  }

  const totalItems = data?.pages?.[0]?.total ?? 0;

  const handleFilterOpen = () => {
    openSidebar({
      view: "DISPLAY_FILTER",
      data: { searchResultCount: totalItems },
    });
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div className="hidden lg:flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("text-search-result", "Search Result")}
          </h2>
          <span className="text-sm text-gray-600">
            {totalItems} {t("text-items", "Items")}
          </span>
        </div>
        <button
          className="lg:hidden text-gray-800 text-sm px-4 py-2 font-semibold border border-gray-300 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-gray-100"
          onClick={handleFilterOpen}
        >
          <FilterIcon className="w-5 h-5 ltr:mr-2.5 rtl:ml-2.5" />
          <span>{t("text-filters", "Filters")}</span>
        </button>
      </div>

      {/* Product grid */}
      <ProductInfiniteGrid
        loading={isLoading}
        data={data ?? { pages: [], pageParams: [] }}
        hasNextPage={hasNextPage}
        loadingMore={loadingMore}
        fetchNextPage={fetchNextPage}
        countryCode={countryCode}
      />
    </>
  );
};

export default ProductSearchBlock;