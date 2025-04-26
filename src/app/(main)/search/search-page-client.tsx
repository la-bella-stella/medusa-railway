// src/app/search/search-page-client.tsx
"use client";

import React, { useState } from "react";
import StickyBox from "react-sticky-box";
import { Breadcrumb } from "@modules/common/components/breadcrumb";
import ActiveLink from "@modules/common/components/active-link";
import StoreFilters from "@modules/store/components/store-filters";
import FilterSidebar from "@modules/store/components/filter-sidebar";
import ProductSearchBlock from "@modules/products/components/product-search-block";
import type { HttpTypes } from "@medusajs/types";
import type { Filters } from "types/global";

export interface SearchPageClientProps {
  region: HttpTypes.StoreRegion;
  countryCode: string;
  filters: Filters;
}

export default function SearchPageClient({
  region,
  countryCode,
  filters: initialFilters,
}: SearchPageClientProps) {
  // lift server-computed filters into local state
  const [filters, setFilters] = useState<Filters>(initialFilters);

  return (
    <>
      {/* Mobile filter drawer */}
      <FilterSidebar filters={filters} onChange={setFilters} />

      <div className="flex flex-col lg:flex-row w-full pt-8 pb-16 lg:pb-20">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <StickyBox offsetTop={50} offsetBottom={20}>
            <div className="pb-7">
              <Breadcrumb
                items={[
                  { label: "breadcrumb-home", href: `/`, linkComponent: ActiveLink },
                  { label: "breadcrumb-search", href: `/search`, linkComponent: ActiveLink },
                ]}
                separator="/"
                className="text-sm text-gray-600 mb-4"
                activeClassName="font-semibold text-heading"
              />
            </div>
            <StoreFilters filters={filters} onChange={setFilters} />
          </StickyBox>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-16">
          <ProductSearchBlock
            region={region}
            countryCode={countryCode}
            filters={filters}
          />
        </div>
      </div>
    </>
  );
}
