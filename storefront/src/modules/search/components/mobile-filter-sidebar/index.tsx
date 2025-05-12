"use client"

import { RefinementList, RangeInput } from "react-instantsearch-hooks-web"
import ClearAllButton from "../clear-all-button"
import { useState } from "react"

export type SortOptions = "created_at" | "price_asc" | "price_desc" | "name_asc" | "name_desc"

type MobileFiltersProps = {
  sortBy?: SortOptions
}

const FACETS = [
  { label: "Category", attr: "categories.name" },
  { label: "Brands", attr: "vendor" },
  { label: "Colors", attr: "color" },
  { label: "Size", attr: "size" },
  { label: "Gender", attr: "metadata.gender" },
  { label: "Season", attr: "metadata.season" },
]

const MobileFilters = ({ sortBy = "created_at" }: MobileFiltersProps) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    FACETS.reduce((acc, { attr }) => ({ ...acc, [attr]: true }), { price: true })
  )

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="w-full bg-white">
      <section className="pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          <ClearAllButton />
        </div>
      </section>

      {FACETS.map(({ label, attr }) => (
        <section key={attr} className="py-6 border-b border-gray-100">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection(attr)}
          >
            <h3 className="text-base font-medium text-gray-700">{label}</h3>
            <svg
              className={`w-5 h-5 transform transition-transform ${collapsedSections[attr] ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`${collapsedSections[attr] ? "hidden" : "block"} mt-4`}>
            <RefinementList
              attribute={attr}
              showMore={true}
              showMoreLimit={10000}
              classNames={{
                root: "",
                list: "flex flex-col space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
                item: "group flex items-center",
                label:
                  "flex items-center cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200",
                checkbox:
                  "w-5 h-5 border-2 border-gray-300 rounded-sm cursor-pointer transition-all duration-200 checked:border-gray-500 checked:text-gray-500 focus:ring-1 focus:ring-gray-200 focus:outline-none mr-3",
                count: "ml-2 text-xs text-gray-400",
                showMore:
                  "text-sm text-gray-600 hover:text-gray-800 font-medium mt-3 transition-colors duration-200",
              }}
            />
          </div>
        </section>
      ))}

      <section className="py-6">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection("price")}
        >
          <h3 className="text-base font-medium text-gray-700">Price Range</h3>
          <svg
            className={`w-5 h-5 transform transition-transform ${collapsedSections.price ? "" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`${collapsedSections.price ? "hidden" : "block"} mt-4`}>
          <RangeInput
            attribute="price"
            classNames={{
              form: "flex items-center space-x-3",
              input:
                "w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all duration-200",
              inputMin: "pl-8",
              inputMax: "pl-8",
              submit:
                "px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium text-sm",
              separator: "text-gray-500 font-medium",
            }}
          >
            <div className="relative flex items-center space-x-3">
              <span className="absolute left-3 text-gray-400">$</span>
              <input
                type="number"
                placeholder="Min"
                className="w-full p-3 pl-8 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all duration-200"
              />
              <span className="text-gray-500 font-medium">–</span>
              <span className="absolute left-3 text-gray-400">$</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full p-3 pl-8 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all duration-200"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium text-sm"
              >
                Apply
              </button>
            </div>
          </RangeInput>
        </div>
      </section>
    </div>
  )
}

export default MobileFilters
