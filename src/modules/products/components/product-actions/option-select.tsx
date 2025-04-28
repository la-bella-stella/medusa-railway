"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  disabled,
  "data-testid": dataTestId,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const isColor = title.toLowerCase() === "color"

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-semibold text-gray-900">Select {title}</span>
      <div className="flex space-x-2" data-testid={dataTestId}>
        {filteredOptions.map((v) => (
          <button
            key={v}
            onClick={() => updateOption(option.id, v)}
            className={clx(
              "border border-gray-300 flex items-center justify-center h-full w-full rounded block",
              {
                "border-gray-900": v === current,
                "hover:border-gray-900 transition-colors ease-in-out duration-150":
                  v !== current && !disabled,
                "opacity-50 cursor-not-allowed": disabled,
                "w-6 h-6": isColor, // Smaller square for color
                "w-8 h-8 text-sm": !isColor, // Larger square for size
              }
            )}
            style={isColor ? { backgroundColor: v } : {}}
            disabled={disabled}
            data-testid="option-button"
          >
            {!isColor && v}
          </button>
        ))}
      </div>
    </div>
  )
}

export default OptionSelect