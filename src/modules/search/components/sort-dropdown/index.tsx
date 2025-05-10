"use client"

import { Listbox, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useSortBy } from "react-instantsearch-hooks-web"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type SortDropdownProps = {
  query: string
  sortBy?: SortOptions
}

const sortOptions: { label: string; value: SortOptions }[] = [
  { label: "Sort by: Alphabetical (A-Z)", value: "products_title_asc" },
  { label: "Sort by: Alphabetical (Z-A)", value: "products_title_desc" },
  { label: "Sort by: Price Low to High", value: "products_price_asc" },
  { label: "Sort by: Price High to Low", value: "products_price_desc" },
]

const SortDropdown = ({ query, sortBy = "products_title_asc" }: SortDropdownProps) => {
  const { refine } = useSortBy({
    items: sortOptions.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  })

  const handleSortChange = (value: SortOptions) => {
    refine(value)
  }

  return (
    <Listbox value={sortBy} onChange={handleSortChange}>
      <div className="relative z-10">
        <Listbox.Button className="text-sm text-gray-600 font-medium bg-white border border-gray-200 rounded-lg py-2.5 px-3 w-48 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-100 hover:bg-gray-50 transition-colors duration-200">
          <span className="block truncate">
            {sortOptions.find((option) => option.value === sortBy)?.label || "Sort Options"}
          </span>
          <span className="flex items-center pointer-events-none">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-5 h-5 text-gray-400"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none z-9999">
            {sortOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 px-3 ${
                    active ? "bg-gray-50 text-gray-800" : "text-gray-600"
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <span
                    className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                  >
                    {option.label}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default SortDropdown