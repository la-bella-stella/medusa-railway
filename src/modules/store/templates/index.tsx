// store-template.tsx
"use client";

import { Suspense } from "react";
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid";
import RefinementList from "@modules/store/components/refinement-list";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import PaginatedProducts from "./paginated-products";
import { useProducts } from "@lib/hooks/use-products"; // Adjust path
import { useQuery } from "@tanstack/react-query";
import { retrieveRegion } from "@lib/data/regions"; // Import retrieveRegion
import { HttpTypes } from "@medusajs/types";

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions;
  page?: string;
  countryCode: string;
}) => {
  const pageNumber = page ? parseInt(page) : 1;
  const sort = sortBy || "created_at";

  // Fetch products using useProducts
  const { data: productsData, isLoading: isProductsLoading, error: productsError } = useProducts({
    sortedBy: sort,
    orderBy: sort.includes("desc") ? "desc" : "asc",
    page: pageNumber,
    countryCode,
    limit: 12, // Matches PRODUCT_LIMIT in PaginatedProducts
    infinite: false, // Paged query
  });

  // Fetch region separately
  const { data: region, isLoading: isRegionLoading, error: regionError } = useQuery<
    HttpTypes.StoreRegion | null,
    Error
  >({
    queryKey: ["region", countryCode],
    queryFn: async () => {
      try {
        // Assume retrieveRegion accepts countryCode or regionId
        const region = await retrieveRegion(countryCode);
        return region || null;
      } catch {
        return null;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Handle loading state
  if (isProductsLoading || isRegionLoading) {
    return <SkeletonProductGrid />;
  }

  // Handle error state
  if (productsError || regionError) {
    return (
      <div>
        Error loading {productsError ? "products" : "region"}:{" "}
        {productsError?.message || regionError?.message}
      </div>
    );
  }

  // Data is available
  const products = productsData?.data || [];
  const totalCount = productsData?.total || 0;

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            products={products}
            totalCount={totalCount}
            region={region}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default StoreTemplate;