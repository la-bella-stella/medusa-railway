"use client";

import React, { useState, useCallback } from "react";
import { HttpTypes } from "@medusajs/types";
import CategoryTemplate from "@modules/categories/templates";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { Filters } from "types/global";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

interface CollectionPageClientProps {
  category: HttpTypes.StoreProductCategory;
  sortBy?: SortOptions;
  page?: string;
  countryCode: string;
  filterData: {
    tags: any[];
    categories: HttpTypes.StoreProductCategory[];
    collections: any[];
    brands: any[];
    colors: any[];
  };
  products: HttpTypes.StoreProduct[];
  region: HttpTypes.StoreRegion | null;
  totalCount: number;
  filters: Filters;
}

export default function CollectionPageClient({
  category,
  sortBy,
  page,
  countryCode,
  filterData,
  products,
  region,
  totalCount,
  filters: initialFilters,
}: CollectionPageClientProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle filter changes
  const onFilterChange = useCallback(
    (next: Filters) => {
      setFilters(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next.category?.length && next.category[0] !== category.id) {
        params.set("category", next.category.join(","));
      } else {
        params.delete("category");
      }
      if (next.brand?.length) {
        params.set("brand", next.brand.join(","));
      } else {
        params.delete("brand");
      }
      if (next.collection?.length) {
        params.set("collection", next.collection.join(","));
      } else {
        params.delete("collection");
      }
      if (next.grouped_color?.length) {
        params.set("grouped_color", next.grouped_color.join(","));
      } else {
        params.delete("grouped_color");
      }
      if (next.gender?.length) {
        params.set("gender", next.gender.join(","));
      } else {
        params.delete("gender");
      }
      if (next.season?.length) {
        params.set("season", next.season.join(","));
      } else {
        params.delete("season");
      }
      if (next.price?.length) {
        params.set("price", next.price[0]);
      } else {
        params.delete("price");
      }
      if (next.tags?.length) {
        params.set("tags", next.tags.join(","));
      } else {
        params.delete("tags");
      }
      router.push(`/collections/${category.handle}?${params.toString()}`);
    },
    [router, searchParams, category.id, category.handle]
  );

  return (
    <CategoryTemplate
      category={category}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      filterData={filterData}
      products={products}
      region={region}
      totalCount={totalCount}
      filters={filters}
      onFilterChange={onFilterChange}
    />
  );
}