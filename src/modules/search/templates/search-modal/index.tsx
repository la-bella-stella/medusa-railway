"use client";

import { InstantSearch, useHits, useSearchBox } from "react-instantsearch-hooks-web";
import { MagnifyingGlassMini, X } from "@medusajs/icons";
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client";
import Hit from "@modules/search/components/hit";
import Hits from "@modules/search/components/hits";
import SearchBox from "@modules/search/components/search-box";
import { useEffect, useRef } from "react";

interface SearchModalProps {
  onClose: () => void;
}

const Results = () => {
  const { query } = useSearchBox();

  if (query.trim().length === 0) return null;

  return (
    <div className="bg-white md:rounded-lg shadow-lg p-4 mt-4">
      <div className="mt-4 max-h-[50vh] sm:max-h-[64vh] overflow-y-auto">
        <Hits hitComponent={Hit} />
      </div>
    </div>
  );
};

export default function SearchModal({ onClose }: SearchModalProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target === searchRef.current) {
      onClose();
    }
  };

  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const input = searchRef.current?.querySelector("input");
    if (input) {
      input.focus();
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />

      <div
        className="fixed top-0 left-1/2 z-50 -translate-x-1/2 w-full sm:w-[600px] md:w-[730px] lg:w-[930px] mt-0 sm:mt-12"
        ref={searchRef}
      >
        <InstantSearch indexName={SEARCH_INDEX_NAME} searchClient={searchClient}>
          <div className="bg-white md:rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between gap-x-2">
              <div className="flex items-center w-full gap-x-2 bg-gray-100 rounded-md px-3 py-2">
                <MagnifyingGlassMini className="text-gray-500" />
                <SearchBox />
              </div>
            </div>
          </div>

          <Results />
        </InstantSearch>
      </div>
    </>
  );
}
