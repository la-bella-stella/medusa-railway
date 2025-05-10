"use client";

import { useTranslation } from "react-i18next";

export type SortOptions = "price_asc" | "price_desc" | "created_at";

type SortProductsProps = {
  sortBy: SortOptions;
  setQueryParams: (name: string, value: SortOptions) => void;
  "data-testid"?: string;
};

const sortOptions = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low -> High" },
  { value: "price_desc", label: "Price: High -> Low" },
];

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const { t } = useTranslation("common");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams("sortBy", event.target.value as SortOptions);
  };

  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={handleChange}
        className="border border-gray-300 text-heading text-[13px] md:text-sm font-semibold relative w-full py-2 ltr:pl-3 rtl:pr-3 ltr:pr-10 rtl:pl-10 ltr:text-left rtl:text-right bg-white rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm cursor-pointer"
        data-testid={dataTestId}
      >
        <option value="" disabled>
          {t("text-sorting-options", "Sorting Options")}
        </option>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(`text-${option.label.toLowerCase().replace(/\s+/g, "-")}`, option.label)}
          </option>
        ))}
      </select>
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          ></path>
        </svg>
      </span>
    </div>
  );
};

export default SortProducts;