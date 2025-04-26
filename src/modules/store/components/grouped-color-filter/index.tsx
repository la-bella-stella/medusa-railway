"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Color {
  id: string;
  value: string;
  meta: string; // hex code
}

interface GroupedColorFilterProps {
  colors: Color[];
  isLoading: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function GroupedColorFilter({
  colors,
  isLoading,
  selected,
  onChange,
}: GroupedColorFilterProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <div>{t("text-loading", "Loading...")}</div>;
  }

  const visible = isExpanded ? colors : colors.slice(0, 5);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="border-t border-gray-200 py-4">
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">{t("text-colors", "Colors")}</h3>
        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {visible.map((c) => (
          <button
            key={c.id}
            onClick={() => toggle(c.value)}
            className={classNames(
              "w-8 h-8 rounded-full border",
              selected.includes(c.value) ? "border-black" : "border-gray-300",
              selected.includes(c.value) && "relative"
            )}
            style={{ backgroundColor: c.meta }}
            title={c.value}
          >
            {selected.includes(c.value) && (
              <span className="absolute top-0 right-0 text-white bg-red-500 rounded-full px-1 text-xs">
                ✓
              </span>
            )}
          </button>
        ))}
        {colors.length > 5 && (
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
