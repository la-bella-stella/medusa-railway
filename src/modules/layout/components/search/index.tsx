"use client";

import React, { useState, useEffect } from "react";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useProducts, StoreProductWithBrand, ProductResponse } from "@lib/hooks/use-products";

interface SearchOverlayProps {
  regionId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_LIMIT = 4;
const DEBOUNCE_DELAY = 1000;

const SearchOverlay = ({ regionId, isOpen, onClose }: SearchOverlayProps) => {
  const { t }: { t: TFunction<"common"> } = useTranslation("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setShouldSearch(searchQuery.trim().length > 0);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data,
    isLoading,
    error,
  }: { data: ProductResponse | undefined; isLoading: boolean; error: Error | null } =
    useProducts({
      text: shouldSearch ? debouncedQuery : undefined,
      regionId,
      limit: SEARCH_LIMIT,
    });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    };

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    }
  }, [isOpen, onClose]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSeeAll = () => {
    onClose();
  };

  if (!isOpen) return null;

  const hasResults = (data?.data ?? []).length > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="fixed top-0 left-1/2 z-50 -translate-x-1/2 w-full sm:w-[600px] md:w-[730px] lg:w-[930px] mt-0 sm:mt-12">
        <div className="bg-white md:rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t("search-placeholder", "Search products...")}
              className="w-full text-sm sm:text-base text-gray-700 focus:outline-none py-2 sm:py-3"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
              aria-label={t("close-search", "Close search")}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {shouldSearch && (
          <div className="mt-2 bg-white md:rounded-lg shadow-lg max-h-[50vh] sm:max-h-[64vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-3 sm:p-4 md:p-5">
                {Array.from({ length: SEARCH_LIMIT }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 md:p-5 border-b border-gray-150 last:border-b-0"
                  >
                    <div className="animate-pulse flex gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-sm text-gray-500 p-3 sm:p-4">
                {t("error", "Error loading results")}
              </p>
            ) : !hasResults ? (
              <p className="text-center text-sm text-gray-500 p-3 sm:p-4">
                {t("no-results", "No products found")}
              </p>
            ) : (
              <>
                <ul>
                  {data?.data?.map((product: StoreProductWithBrand) => (
                    <li
                      key={product.id}
                      className="p-3 sm:p-4 md:p-5 border-b border-gray-150 last:border-b-0"
                    >
                      <LocalizedClientLink
                        href={`/products/${product.handle}`}
                        className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100"
                        onClick={onClose}
                      >
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded" />
                        )}
                        <span className="text-sm text-gray-700">{product.title}</span>
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
                {hasResults && (
                  <div className="border-t border-gray-150">
                    <button
                      onClick={handleSeeAll}
                      className="w-full block text-sm md:text-base text-center px-4 py-3 lg:py-3.5 bg-gray-200 text-gray-700 text-opacity-80 hover:text-opacity-100 transition"
                    >
                      {t("load-more-products", "See All Results")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default SearchOverlay;