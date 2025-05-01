"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandFilterProps {
  brands: Brand[];
  isLoading: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function BrandFilter({
  brands,
  isLoading,
  selected,
  onChange,
}: BrandFilterProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <div>{t("text-loading", "Loading...")}</div>;
  }

  const visible = isExpanded ? brands : brands.slice(0, 5);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-heading text-sm md:text-base font-semibold">
          {t("text-brands", "Brands")}
        </h3>
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          height="16"
          width="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
        </svg>
      </div>
      <div className="mt-2">
        {visible.map((brand) => (
          <label key={brand.id} className="block py-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(brand.id)}
              onChange={() => toggle(brand.id)}
            />
            {brand.name}
          </label>
        ))}
        {brands.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 mt-2"
          >
            {isExpanded
              ? t("text-show-less", "Show Less")
              : t("text-show-more", "Show More")}
          </button>
        )}
      </div>
    </div>
  );
}