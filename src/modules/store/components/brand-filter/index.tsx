"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

interface Collection {
  id: string;
  title: string;
  handle: string;
}

interface CollectionFilterProps {
  collections: Collection[];
  isLoading: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
  countryCode?: string; // Add countryCode prop
}

export default function CollectionFilter({
  collections,
  isLoading,
  selected,
  onChange,
  label = "Collections",
  countryCode = "us", // Default country code
}: CollectionFilterProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <div>{t("text-loading", "Loading...")}</div>;
  }

  const visible = isExpanded ? collections : collections.slice(0, 5);

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
          {t(`text-${label.toLowerCase()}`, label)}
        </h3>
        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </div>
      <div className="mt-2">
        {visible.map((c) => (
          <div key={c.id} className="block py-1 flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
            <LocalizedClientLink
              href={`/brand/${c.handle}/${countryCode}`}
              className="text-gray-700 hover:text-blue-500"
            >
              {c.title}
            </LocalizedClientLink>
          </div>
        ))}
        {collections.length > 5 && (
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