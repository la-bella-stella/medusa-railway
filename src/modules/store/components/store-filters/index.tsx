"use client";

import React from "react";
import type { Filters } from "types/global";
import CategoryFilter from "@modules/store/components/category-filter";
import BrandFilter from "@modules/store/components/brand-filter";
import CollectionFilter from "@modules/store/components/collection-filter";
import GroupedColorFilter from "@modules/store/components/grouped-color-filter";
import CustomFieldFilter from "@modules/store/components/custom-field-filter";
import PriceFilter from "@modules/store/components/price-filter";
import { useCategories } from "@lib/hooks/use-categories";
import { useBrands } from "@lib/hooks/use-brands";
import { useCollections } from "@lib/hooks/use-collections";
import { useColors } from "@lib/hooks/use-colors";
import { useTags } from "@lib/hooks/use-tags";

interface StoreFiltersProps {
  filters: Filters;
  onChange?: (next: Filters) => void;
  className?: string;
}

export default function StoreFilters({
  filters,
  onChange = () => {},
  className,
}: StoreFiltersProps) {
  const { data: categories = [], isLoading: loadingCat } = useCategories();
  const { data: brands = [], isLoading: loadingBrand } = useBrands();
  const { data: collections = [], isLoading: loadingColl } = useCollections();
  const { data: colors = [], isLoading: loadingColor } = useColors();
  const { data: tags = [], isLoading: loadingTags } = useTags();

  // Derive gender & season from tags
  const genderTags = tags
    .filter((t) =>
      ["men", "women"].some((g) => t.value.toLowerCase().includes(g))
    )
    .map((t) => ({ id: t.id, value: t.value }));
  const seasonTags = tags
    .filter((t) =>
      ["spring", "summer", "autumn", "winter"].some((s) =>
        t.value.toLowerCase().includes(s)
      )
    )
    .map((t) => ({ id: t.id, value: t.value }));

  // Helper to update one key in the filters object
  const update = (key: keyof Filters, next: string[]) =>
    onChange({ ...filters, [key]: next });

  return (
    <div className={`flex flex-col gap-y-4 ${className || ""}`}>
      {/* Category */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          isLoading={loadingCat}
          selected={filters.category ?? []}
          onChange={(next) => update("category", next)}
        />
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <BrandFilter
          brands={brands}
          isLoading={loadingBrand}
          selected={filters.brand ?? []}
          onChange={(next) => update("brand", next)}
        />
      )}

      {/* Collection */}
      {collections.length > 0 && (
        <CollectionFilter
          collections={collections}
          isLoading={loadingColl}
          selected={filters.collection ?? []}
          onChange={(next) => update("collection", next)}
        />
      )}

      {/* Color */}
      {colors.length > 0 && (
        <GroupedColorFilter
          colors={colors}
          isLoading={loadingColor}
          selected={filters.grouped_color ?? []}
          onChange={(next) => update("grouped_color", next)}
        />
      )}

      {/* Gender */}
      {genderTags.length > 0 && (
        <CustomFieldFilter
          label="Gender"
          values={genderTags}
          isLoading={loadingTags}
          selected={filters.gender ?? []}
          onChange={(next) => update("gender", next)}
        />
      )}

      {/* Season */}
      {seasonTags.length > 0 && (
        <CustomFieldFilter
          label="Season"
          values={seasonTags}
          isLoading={loadingTags}
          selected={filters.season ?? []}
          onChange={(next) => update("season", next)}
        />
      )}

      {/* Price */}
      <PriceFilter
        selected={filters.price ?? []}
        onChange={(next) => update("price", next)}
      />
    </div>
  );
}