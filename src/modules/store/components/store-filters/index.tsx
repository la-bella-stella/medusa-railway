"use client";

import React from "react";
import type { Filters } from "types/global";
import BrandFilter from "@modules/store/components/brand-filter";
import CategoryFilter from "@modules/store/components/category-filter";
import CollectionFilter from "@modules/store/components/collection-filter";
import GroupedColorFilter from "@modules/store/components/grouped-color-filter";
import CustomFieldFilter from "@modules/store/components/custom-field-filter";
import PriceFilter from "@modules/store/components/price-filter";
import { HttpTypes } from "@medusajs/types";

interface StoreFiltersProps {
  filters: Filters;
  onChange?: (next: Filters) => void;
  className?: string;
  filterData?: {
    tags: any[];
    categories: HttpTypes.StoreProductCategory[];
    collections: any[];
    brands: { id: string; name: string; slug: string }[];
    colors: { id: string; value: string; meta: string }[];
  };
}

export default function StoreFilters({
  filters,
  onChange = () => {},
  className,
  filterData = {
    tags: [],
    categories: [],
    collections: [],
    brands: [],
    colors: [],
  },
}: StoreFiltersProps) {
  // Derive gender, season, and size from tags
  const genderTags = filterData.tags
    .filter((t: any) =>
      ["men", "women"].some((g) => t.value.toLowerCase().includes(g))
    )
    .map((t: any) => ({ id: t.id, value: t.value }));
  const seasonTags = filterData.tags
    .filter((t: any) =>
      ["spring", "summer", "autumn", "winter"].some((s) =>
        t.value.toLowerCase().includes(s)
      )
    )
    .map((t: any) => ({ id: t.id, value: t.value }));
  const sizeTags = filterData.tags
    .filter((t: any) =>
      ["xs", "s", "m", "l", "xl", "xxl"].some((s) =>
        t.value.toLowerCase().includes(s)
      )
    )
    .map((t: any) => ({ id: t.id, value: t.value }));

  // Helper to update one key in the filters object
  const update = (key: keyof Filters, next: string[]) =>
    onChange({ ...filters, [key]: next });

  return (
    <div className={`flex flex-col gap-y-4 ${className || ""}`}>
      {/* Category */}
      {filterData.categories.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <CategoryFilter
            categories={filterData.categories.map((c) => ({
              id: c.id,
              name: c.name,
              handle: c.handle,
              productCount: c.products?.length || 0,
            }))}
            isLoading={false}
            selected={filters.category ?? []}
            onChange={(next) => update("category", next)}
          />
        </div>
      )}

      {/* Brand */}
      {filterData.brands.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <BrandFilter
            brands={filterData.brands}
            isLoading={false}
            selected={filters.brand ?? []}
            onChange={(next) => update("brand", next)}
          />
        </div>
      )}

      {/* Collection */}
      {filterData.collections.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <CollectionFilter
            collections={filterData.collections}
            isLoading={false}
            selected={filters.collection ?? []}
            onChange={(next) => update("collection", next)}
          />
        </div>
      )}

      {/* Price */}
      <div className="block border-b border-gray-300 pb-7 mb-7">
        <PriceFilter
          selected={filters.price ?? []}
          onChange={(next) => update("price", next)}
        />
      </div>

      {/* Color */}
      {filterData.colors.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <GroupedColorFilter
            colors={filterData.colors}
            isLoading={false}
            selected={filters.grouped_color ?? []}
            onChange={(next) => update("grouped_color", next)}
          />
        </div>
      )}

      {/* Size */}
      {sizeTags.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <CustomFieldFilter
            label="Size"
            values={sizeTags}
            isLoading={false}
            selected={filters.tags ?? []}
            onChange={(next) => update("tags", next)}
          />
        </div>
      )}

      {/* Gender */}
      {genderTags.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <CustomFieldFilter
            label="Gender"
            values={genderTags}
            isLoading={false}
            selected={filters.gender ?? []}
            onChange={(next) => update("gender", next)}
          />
        </div>
      )}

      {/* Season */}
      {seasonTags.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <CustomFieldFilter
            label="Season"
            values={seasonTags}
            isLoading={false}
            selected={filters.season ?? []}
            onChange={(next) => update("season", next)}
          />
        </div>
      )}

      {/* Tags */}
      {filterData.tags.length > 0 && (
        <div className="block border-b border-gray-300 pb-7 mb-7">
          <CustomFieldFilter
            label="Tags"
            values={filterData.tags.map((t: any) => ({ id: t.id, value: t.value }))}
            isLoading={false}
            selected={filters.tags ?? []}
            onChange={(next) => update("tags", next)}
          />
        </div>
      )}
    </div>
  );
}