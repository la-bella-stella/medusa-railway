"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface CustomFieldValue {
  id: string;
  value: string;
}

interface CustomFieldFilterProps {
  label: string;
  values: CustomFieldValue[];
  isLoading: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function CustomFieldFilter({
  label,
  values,
  isLoading,
  selected,
  onChange,
}: CustomFieldFilterProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <div>{t("text-loading", "Loading...")}</div>;
  }

  const visible = isExpanded ? values : values.slice(0, 5);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="border-t border-gray-200 py-4">
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">{label}</h3>
        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </div>
      <div className="mt-2">
        {visible.map((item) => (
          <label key={item.id} className="block py-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(item.value)}
              onChange={() => toggle(item.value)}
            />
            {item.value}
          </label>
        ))}
        {values.length > 5 && (
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
