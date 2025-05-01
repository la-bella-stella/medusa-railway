"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

interface Color {
  id: string;
  value: string;
  meta: string;
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
    <div>
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-heading text-sm md:text-base font-semibold">
          {t("text-colors", "Colors")}
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