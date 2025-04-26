"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Category {
  id: string;
  name: string;
  handle: string;
  productCount: number;
}

interface CategoryFilterProps {
  categories: Category[];
  isLoading: boolean;
  selected: string[];               // <-- array of IDs
  onChange: (next: string[]) => void;
}

export default function CategoryFilter({
  categories,
  isLoading,
  selected,
  onChange,
}: CategoryFilterProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <div>{t("text-loading", "Loading...")}</div>;
  }

  const visible = isExpanded ? categories : categories.slice(0, 5);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="border-t border-gray-200 py-4">
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">
          {t("text-category", "Category")}
        </h3>
        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </div>
      <div className="mt-2">
        {visible.map((c) => (
          <label key={c.id} className="block py-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
            {c.name}
            {c.productCount > 0 && (
              <span className="ml-1 text-gray-500 text-sm">
                ({c.productCount})
              </span>
            )}
          </label>
        ))}
        {categories.length > 5 && (
          <button
            className="text-blue-500 mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
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
