// src/modules/store/components/price-filter.tsx
"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface PriceRange {
  id: string;
  name: string;
  slug: string;
}

interface PriceFilterProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

const priceFilterItems: PriceRange[] = [
  { id: "6", name: "$300 to $500",    slug: "300-500" },
  { id: "7", name: "$500 to $1000",   slug: "500-1000" },
  { id: "8", name: "$1000 to $2000",  slug: "1000-2000" },
  { id: "9", name: "Over $2000",      slug: "2000-99999" },
];

export default function PriceFilter({
  selected,
  onChange,
}: PriceFilterProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  const visible = isExpanded ? priceFilterItems : priceFilterItems.slice(0, 5);

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <div className="border-t border-gray-200 py-4">
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">{t("text-price", "Price")}</h3>
        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </div>
      <div className="mt-2">
        {visible.map((item) => (
          <label key={item.id} className="block py-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(item.slug)}
              onChange={() => toggle(item.slug)}
            />
            {item.name}
          </label>
        ))}
        {priceFilterItems.length > 5 && (
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
