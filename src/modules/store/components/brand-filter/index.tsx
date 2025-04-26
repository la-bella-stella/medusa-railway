// src/modules/store/components/brand-filter.tsx
"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandFilterProps {
  brands: Brand[];
  isLoading: boolean;
  selected: string[];               // array of brand IDs
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

  // Show either all or first 5
  const visible = isExpanded ? brands : brands.slice(0, 5);

  // Toggle a brand ID in/out of the selected array
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="border-t border-gray-200 py-4">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">
          {t("text-brands", "Brands")}
        </h3>
        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </div>

      {/* Checkbox list */}
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

        {/* Show more / less */}
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
