"use client";

import React, { useState, useRef, useEffect } from "react";
import SearchBox from "@modules/common/components/search-box";
import { IoCloseSharp } from "react-icons/io5";
import classNames from "classnames";
import { HttpTypes } from "@medusajs/types";
import { useProducts } from "@lib/hooks/use-products";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";
import Scrollbar from "@modules/layout/components/scrollbar";
import SearchProduct from "@modules/common/components/search-product";
import SearchResultLoader from "@modules/common/components/loaders/search-result-loader";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@medusajs/ui";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  region: HttpTypes.StoreRegion | null;
  countryCode: string;
}

export default function SearchOverlay({
  open,
  onClose,
  region,
  countryCode,
}: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation("common");

  const { data, isLoading: loading } = useProducts({
    text: searchTerm,
    limit: 4,
    regionId: region?.id,
  });

  // Focus input when opened; clear value when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearchTerm("");
    }
  }, [open]);

  // Handle scroll locking
  useEffect(() => {
    if (overlayRef.current) {
      open ? disableBodyScroll(overlayRef.current) : enableBodyScroll(overlayRef.current);
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, [open]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/${countryCode}/search?q=${encodeURIComponent(searchTerm)}`;
    }
    onClose();
  };

  const handleClear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchTerm("");
      inputRef.current?.focus();
    } else {
      onClose();
    }
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  };

  const handleSeeAll = () => {
    if (searchTerm.trim()) {
      router.push(`/${countryCode}/search?q=${encodeURIComponent(searchTerm)}`);
    }
    onClose();
  };

  const hasResults = (data?.data?.length ?? 0) > 0;
  const totalResults = data?.paginatorInfo?.total ?? 0;

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={classNames("search-overlay", { open })}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={classNames(
          "drawer-search relative hidden top-0 z-30 opacity-0 invisible transition duration-300 ease-in-out left-1/2 px-4 w-full md:w-[730px] lg:w-[930px]",
          { open }
        )}
      >
        <div className="w-full flex flex-col justify-center">
          <div className="flex-shrink-0 mt-3.5 lg:mt-4 w-full">
            <div className="flex flex-col mx-auto mb-1.5 w-full relative">
              <SearchBox
                onSubmit={handleSubmit}
                onClear={handleClear}
                onChange={handleChange}
                name="search"
                value={searchTerm}
                ref={(input) => {
                  if (input) {
                    input.focus();
                  }
                }}
              />
              <button
                className="absolute top-4 right-4 text-gray-600"
                onClick={onClose}
                aria-label="Close"
              >
                <IoCloseSharp size={24} />
              </button>
            </div>

            {searchTerm && (
              <div className="bg-white flex flex-col rounded-md overflow-hidden h-full max-h-64vh">
                <Scrollbar className="os-host-flexbox">
                  <div className="h-full">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          className="p-4 md:p-5 border-b border-gray-150 last:border-b-0"
                          key={idx}
                        >
                          <SearchResultLoader uniqueKey={`top-search-${idx}`} />
                        </div>
                      ))
                    ) : hasResults ? (
                      <>
                        {data?.data.map((item: HttpTypes.StoreProduct, index: number) => (
                          <div
                            className="p-4 md:p-5 border-b border-gray-150 relative last:border-b-0"
                            onClick={onClose}
                            key={item.id}
                          >
                            <SearchProduct
                              item={item}
                              region={region}
                              countryCode={countryCode}
                              key={index}
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="w-full h-full px-5 md:px-10 mb-4 md:pb-6 pt-8 md:pt-12 flex items-center justify-center">
                        <div className="flex items-center justify-center max-w-[520px]">
                          <Image
                            src="/not-found.svg"
                            alt={t("text-no-result-found")}
                            width={520}
                            height={520}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Scrollbar>

                {(hasResults || totalResults > 0) && (
                  <div className="w-full overflow-hidden border-t border-gray-150">
                    <Button
                      variant="transparent"
                      onClick={handleSeeAll}
                      className="w-full block text-sm md:text-base text-center px-4 py-3 lg:py-3.5 bg-gray-200 text-heading text-opacity-80 transition hover:text-opacity-100"
                    >
                      {t("text-load-more-products")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}