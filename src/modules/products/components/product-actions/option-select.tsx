"use client";

import React from "react";
import { HttpTypes } from "@medusajs/types";
import { clx } from "@medusajs/ui";

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption;
  current: string | undefined;
  updateOption: (title: string, value: string) => void;
  title: string;
  disabled: boolean;
  "data-testid"?: string;
};

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  disabled,
  "data-testid": dataTestId,
}) => {
  const isColor = title.toLowerCase().includes("color");

  // Check if option.values is defined
  if (!option.values || option.values.length === 0) {
    return null; // Skip rendering if no values are available
  }

  return (
    <div className="mb-4">
      <h3 className="font-semibold capitalize text-base md:text-lg text-heading mb-2.5">
        {title}
      </h3>
      <ul className="colors flex flex-wrap ltr:-mr-10 rtl:-ml-10 gap-4" data-testid={dataTestId}>
        {option.values.map((v) => {
          const isSelected = v.value === current;
          const liClasses = clx(
            "cursor-pointer rounded border min-w-[36px] md:min-w-[44px] min-h-[36px] md:min-h-[44px] p-1 mb-2 md:mb-3 ltr:mr-8! rtl:ml-8! ltr:md:mr-10! rtl:md:ml-10! flex justify-center items-center text-heading text-xs md:text-sm uppercase font-semibold transition duration-200 ease-in-out debug-border",
            {
              "border-black": isSelected,
              "border-gray-100": !isSelected,
              "hover:border-black": !isSelected && !disabled,
              "opacity-50 cursor-not-allowed": disabled,
              "px-3 md:px-3.5": !isColor,
            }
          );

          return (
            <li
              key={v.value}
              className={liClasses}
              onClick={() => !disabled && updateOption(option.id, v.value)}
              data-testid="option-button"
            >
              {isColor ? (
                <span
                  className="h-full w-full rounded block"
                  style={{ backgroundColor: v.value }}
                />
              ) : (
                v.value
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OptionSelect;