"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Collection {
  id: string;
  title: string;
  handle: string;
}

interface CollectionFilterProps {
  collections: Collection[];
  isLoading: boolean;
  selected: string[];            // <-- array of IDs
  onChange: (next: string[]) => void;
}

export default function CollectionFilter({
  collections,
  isLoading,
  selected,
  onChange,
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
          {t("text-collections", "Collections")}
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
            {c.title}
          </label>
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
