// src/modules/products/components/product-infinite-grid/index.tsx
"use client";

import React from "react";
import ProductCard from "@modules/products/components/product-card";
import Button from "@modules/common/components/button";
import { useTranslation } from "react-i18next";
import NotFound from "@modules/common/components/not-found";
import isEmpty from "lodash/isEmpty";
import ProductFeedLoader from "@modules/common/components/loaders/product-feed-loader";
import { HttpTypes } from "@medusajs/types";

interface ProductInfiniteGridProps {
  className?: string;
  loading: boolean;
  data?: {
    pages: { data: HttpTypes.StoreProduct[]; region: HttpTypes.StoreRegion | null }[];
    pageParams: any[];
  };
  hasNextPage?: boolean;
  loadingMore: boolean;
  fetchNextPage: () => void;
  countryCode?: string;               // ← add this
}

const ProductInfiniteGrid: React.FC<ProductInfiniteGridProps> = ({
  className = "",
  loading,
  // default data so `data.pages` is never undefined
  data = { pages: [], pageParams: [] },
  hasNextPage,
  loadingMore,
  fetchNextPage,
  countryCode,                       // ← destructure it
}) => {
  const { t } = useTranslation("common");

  const firstPage = data.pages[0];
  if (!loading && (!firstPage || isEmpty(firstPage.data))) {
    return <NotFound text={t("text-no-products-found", "No products found")} />;
  }

  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3
                    gap-x-3 lg:gap-x-5 xl:gap-x-7
                    gap-y-3 xl:gap-y-5 2xl:gap-y-8
                    ${className}`}
      >
        {loading && data.pages.length === 0 ? (
          <ProductFeedLoader limit={20} uniqueKey="search-product" />
        ) : (
          data.pages.map((page, pageIndex) =>
            (page.data || []).map((product) => (
              <ProductCard
                key={`page-${pageIndex}-product-${product.id}`}
                product={product}
                variant="grid"
              />
            ))
          )
        )}
      </div>

      {hasNextPage && (
        <div className="pt-8 text-center xl:pt-14">
          <Button
            loading={loadingMore}
            disabled={loadingMore}
            onClick={fetchNextPage}
            variant="slim"
          >
            {t("button-load-more", "Load More")}
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductInfiniteGrid;
