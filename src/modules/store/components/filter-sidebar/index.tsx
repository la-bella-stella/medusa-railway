"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/solid";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { search } from "@modules/search/actions";
import type { Filters } from "types/global";

// Explicitly type the search function to ensure TypeScript recognizes the second argument
const searchAction: (query: string, filters: Filters) => Promise<any[]> = search;

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange }) => {
  const { t } = useTranslation("common");
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
    grouped_color: true,
    gender: true,
    season: true,
    tags: true,
  });

  // Map Filters to Meilisearch fields
  const filterMapping: Partial<Record<keyof Filters, string>> = {
    category: "categories",
    brand: "brand",
    price: "variants.metadata.msrp",
    grouped_color: "variants.color",
    gender: "metadata.gender",
    season: "metadata.season",
    tags: "metadata.style",
  };

  // Fetch facet distributions
  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const hits = await searchAction(filters.q || "", filters);
        const facetDistribution: Record<string, Record<string, number>> = {};

        // Aggregate facets from hits
        Object.keys(filterMapping).forEach((key) => {
          const typedKey = key as keyof Filters;
          if (typedKey === "q") return;
          const facetKey = filterMapping[typedKey]!;
          facetDistribution[facetKey] = {};

          hits.forEach((hit: any) => {
            let values = hit[facetKey];
            if (!values) return;

            if (!Array.isArray(values)) {
              values = [values];
            }

            values.forEach((value: string) => {
              if (value) {
                facetDistribution[facetKey][value] =
                  (facetDistribution[facetKey][value] || 0) + 1;
              }
            });
          });
        });

        setFacets(facetDistribution);
      } catch (error) {
        console.error("Error fetching facets:", error);
      }
    };
    fetchFacets();
  }, [filters]);

  // Handle filter selection
  const toggleFilter = (key: keyof Filters, value: string) => {
    const newFilters: Filters = { ...filters };
    if (key === "q") return; // Skip q as it's not a filterable array
    const currentValues = Array.isArray(newFilters[key]) ? newFilters[key] : [];
    newFilters[key] = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: Filters = {
      q: filters.q || "",
      category: [],
      brand: [],
      collection: [],
      grouped_color: [],
      gender: [],
      season: [],
      price: [],
      tags: [],
    };
    onChange(clearedFilters);
  };

  // Toggle filter section
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter sections configuration
  const filterSections = [
    { key: "category", title: t("Categories"), meilisearchKey: "categories" },
    { key: "brand", title: t("Brands"), meilisearchKey: "brand" },
    { key: "price", title: t("MSRP"), meilisearchKey: "variants.metadata.msrp" },
    { key: "grouped_color", title: t("Colors"), meilisearchKey: "variants.color" },
    { key: "gender", title: t("Gender"), meilisearchKey: "metadata.gender" },
    { key: "season", title: t("Season"), meilisearchKey: "metadata.season" },
    { key: "tags", title: t("Style"), meilisearchKey: "metadata.style" },
  ];

  return (
    <div className="flex-shrink-0 hidden ltr:pr-24 rtl:pl-24 lg:block w-96">
      <div style={{ position: "relative", top: "0px" }}>
        <div className="pb-7">
          {/* Breadcrumbs */}
          <div className="flex items-center chawkbazarBreadcrumb">
            <ol className="flex items-center w-full overflow-hidden">
              <li className="text-sm text-body px-2.5 transition duration-200 ease-in ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:last:pl-0 hover:text-heading">
                <LocalizedClientLink href="/">{t("Home")}</LocalizedClientLink>
              </li>
              <li className="text-base text-body mt-0.5">/</li>
              <li className="text-sm text-body px-2.5 transition duration-200 ease-in ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:last:pl-0 hover:text-heading">
                <LocalizedClientLink href="/search" className="capitalize font-semibold text-heading">
                  {t("Search")}
                </LocalizedClientLink>
              </li>
            </ol>
          </div>
        </div>

        <div className="pt-1">
          {/* Filters Header */}
          <div className="block border-b border-gray-300 pb-7 mb-7">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-semibold text-heading text-xl md:text-2xl">{t("Filters")}</h2>
              <button
                className="flex-shrink text-xs mt-0.5 transition duration-200 ease-in focus:outline-none hover:text-heading"
                onClick={clearFilters}
                aria-label={t("Clear All")}
              >
                {t("Clear All")}
              </button>
            </div>
            {/* Selected Filters */}
            <div className="flex flex-wrap -m-1.5 pt-2">
              {Object.keys(filters).filter((key): key is keyof Filters => key !== "q").flatMap((key) =>
                (Array.isArray(filters[key]) ? filters[key] : []).map((value: string) => (
                  <div
                    key={`${key}-${value}`}
                    className="group flex flex-shrink-0 m-1.5 items-center border border-gray-300 bg-borderBottom rounded-lg text-xs px-3.5 py-2.5 capitalize text-heading cursor-pointer transition duration-200 ease-in-out hover:border-heading"
                    onClick={() => toggleFilter(key, value)}
                  >
                    {value}
                    <XMarkIcon className="text-sm text-body ltr:ml-2 rtl:mr-2 flex-shrink-0 ltr:-mr-0.5 rtl:-ml-0.5 mt-0.5 transition duration-200 ease-in-out group-hover:text-heading" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Filter Sections */}
          {filterSections.map((section) => (
            <div key={section.key} className="block border-b border-gray-300 pb-7 mb-7">
              <div
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleSection(section.key)}
              >
                <h3 className="text-heading text-sm md:text-base font-semibold">{section.title}</h3>
                <ChevronDownIcon
                  className={cn("h-4 w-4 transition-transform duration-200", {
                    "rotate-180": openSections[section.key],
                  })}
                />
              </div>
              {openSections[section.key] && (
                <div className="space-y-2">
                  {section.key === "price" ? (
                    // MSRP range input
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        onChange={(e) => {
                          const min = e.target.value;
                          if (min) {
                            const value = `${min}-999999`; // Adjust max as needed
                            toggleFilter(section.key as keyof Filters, value);
                          }
                        }}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        onChange={(e) => {
                          const max = e.target.value;
                          if (max) {
                            const value = `0-${max}`; // Adjust min as needed
                            toggleFilter(section.key as keyof Filters, value);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    // Checkbox filters
                    Object.entries(facets[section.meilisearchKey] || {}).map(([value, count]) => (
                      <label key={value} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters[section.key as keyof Filters]?.includes(value) || false}
                          onChange={() => toggleFilter(section.key as keyof Filters, value)}
                          className="h-4 w-4 text-heading focus:ring-heading"
                        />
                        <span>
                          {value} ({count})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;