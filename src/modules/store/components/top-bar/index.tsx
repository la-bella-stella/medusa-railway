"use client";

import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import FilterIcon from "@modules/common/icons/filter-icon";
import { IoCloseSharp } from "react-icons/io5";
import classNames from "classnames";
import { useUI } from "@lib/context/ui-context";
import StoreFilters from "@modules/store/components/store-filters";
import type { Filters } from "types/global";

interface SearchTopBarProps {
  searchResultCount: number;
  className?: string;
}

export const SearchTopBar: React.FC<SearchTopBarProps> = ({
  searchResultCount,
  className,
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSidebarOpen, sidebarView, openSidebar, closeSidebar } = useUI();

  // Build filters from searchParams
  const filters: Filters = {
    category: searchParams.get("category")?.split(",") ?? [],
    brand: searchParams.get("brand")?.split(",") ?? [],
    collection: searchParams.get("collection")?.split(",") ?? [],
    grouped_color: searchParams.get("grouped_color")?.split(",") ?? [],
    gender: searchParams.get("gender")?.split(",") ?? [],
    season: searchParams.get("season")?.split(",") ?? [],
    price: searchParams.get("price") ? [searchParams.get("price")!] : [],
    tags: searchParams.get("tags")?.split(",") ?? [],
  };

  // Handle filter changes
  const onChange = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.category?.length) {
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
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle filter sidebar toggle
  const handleFilterOpen = useCallback(() => {
    openSidebar({
      view: "DISPLAY_FILTER",
      data: { searchResultCount },
    });
  }, [openSidebar, searchResultCount]);

  // Handle sorting
  const handleSortChange = (value: string) => {
    const [sortField, sortDirection] = value.split("|");
    const params = new URLSearchParams(searchParams.toString());
    if (sortField && sortDirection) {
      params.set("sortedBy", sortField);
      params.set("orderBy", sortDirection);
    } else {
      params.delete("sortedBy");
      params.delete("orderBy");
    }
    router.push(`/search?${params.toString()}`);
  };

  // Get the query for the heading
  const query = searchParams.get("q");
  const heading = query
    ? t("text-search-result-with-query", "Search Results for '{{query}}'", {
        query,
      })
    : t("text-search-result", "Search Results");

  return (
    <div
      className={classNames("flex justify-between items-center mb-7", className)}
    >
      {/* Page Heading (Desktop) */}
      <h2 className="hidden lg:inline-flex text-xl font-semibold text-gray-800 pb-1">
        {heading}
      </h2>

      {/* Mobile Filter Button */}
      <button
        className="lg:hidden text-gray-800 text-sm px-4 py-2 font-semibold border border-gray-300 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-gray-200"
        onClick={handleFilterOpen}
      >
        <FilterIcon className="w-5 h-5 ltr:mr-2.5 rtl:ml-2.5" />
        <span>{t("text-filters", "Filters")}</span>
      </button>

      {/* Result Count and Sorting (Desktop) */}
      <div className="flex items-center justify-end">
        {/* Result Count */}
        <div className="flex-shrink-0 text-gray-600 text-xs md:text-sm leading-4 ltr:pr-4 rtl:pl-4 ltr:md:mr-6 rtl:md:ml-6 ltr:pl-2 rtl:pr-2 hidden lg:block">
          {searchResultCount ?? 0} {t("text-items", "Items")}
        </div>

        {/* Sorting Dropdown */}
        <select
          onChange={(e) => handleSortChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
          defaultValue="options"
        >
          <option value="options" disabled>
            {t("text-sorting-options", "Sorting Options")}
          </option>
          <option value="created_at|ASC">
            {t("text-oldest", "Oldest")}
          </option>
          <option value="orders_count|DESC">
            {t("text-popularity", "Popularity")}
          </option>
          <option value="min_price|ASC">
            {t("text-price-low-high", "Price: Low to High")}
          </option>
          <option value="max_price|DESC">
            {t("text-price-high-low", "Price: High to Low")}
          </option>
        </select>
      </div>

      {/* Mobile Filter Sidebar */}
      {isSidebarOpen && sidebarView === "DISPLAY_FILTER" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        >
          <div
            className="fixed top-0 left-0 w-3/4 h-full bg-white shadow-lg z-50 transition-transform duration-200 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold">{t("text-filters", "Filters")}</h3>
              <button
                className="absolute top-4 right-4 text-gray-600"
                onClick={closeSidebar}
                aria-label="Close"
              >
                <IoCloseSharp size={24} />
              </button>
              <StoreFilters filters={filters} onChange={onChange} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTopBar;