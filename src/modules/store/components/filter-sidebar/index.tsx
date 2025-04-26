// src/modules/store/components/filter-sidebar.tsx
"use client";

import React from "react";
import Scrollbar from "@modules/layout/components/scrollbar";
import StoreFilters from "@modules/store/components/store-filters";
import { useUI } from "@lib/context/ui-context";
import { useTranslation } from "react-i18next";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import type { Filters } from "types/global";

interface FilterSidebarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
}

export default function FilterSidebar({
  filters,
  onChange,
}: FilterSidebarProps) {
  const { isSidebarOpen, sidebarView, sidebarData, closeSidebar } = useUI();
  const { t, i18n } = useTranslation("common");
  const dir = i18n.dir();

  if (!isSidebarOpen || sidebarView !== "DISPLAY_FILTER") {
    return null;
  }

  const count = sidebarData?.searchResultCount ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeSidebar}>
      <div
        className="fixed top-0 left-0 w-3/4 h-full bg-white shadow-lg z-50 transition-transform duration-200 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-2">
            <button
              onClick={closeSidebar}
              aria-label="Close filters"
              className="p-2"
            >
              {dir === "rtl" ? <IoArrowForward /> : <IoArrowBack />}
            </button>
            <h2 className="font-bold text-xl">{t("text-filters")}</h2>
            <div className="w-8" />
          </div>

          {/* Filters */}
          <Scrollbar className="flex-grow overflow-auto">
            <div className="p-4">
              <StoreFilters filters={filters} onChange={onChange} />
            </div>
          </Scrollbar>

          {/* Footer */}
          <div className="p-4 bg-gray-100 text-center">
            {count} {t("text-items")}
          </div>
        </div>
      </div>
    </div>
  );
}
