"use client"; // Add this directive

import { useRouter, useSearchParams } from "next/navigation";
import { SortOptions } from "./sort-products";
import { useState } from "react";

type RefinementListProps = {
  sortBy: SortOptions;
  search?: boolean
  "data-testid"?: string;
};

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low -> High" },
  { value: "price_desc", label: "Price: High -> Low" },
];

export default function RefinementList({ sortBy, "data-testid": dataTestId }: RefinementListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (value: SortOptions) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const selectedLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Sorting Options";

  return (
    <div className="relative" data-testid={dataTestId}>
      <button
        className="border border-gray-300 text-heading text-[13px] md:text-sm font-semibold relative w-full py-2 ltr:pl-3 rtl:pr-3 ltr:pr-10 rtl:pl-10 ltr:text-left rtl:text-right bg-white rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="block truncate">{selectedLabel}</span>
        <span className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center ltr:pr-2 rtl:pl-2 pointer-events-none">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="w-5 h-5 text-gray-400"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {sortOptions.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 text-sm text-heading hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}