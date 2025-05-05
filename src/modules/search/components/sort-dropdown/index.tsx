"use client"

import { Listbox, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type SortDropdownProps = {
  query: string
  sortBy?: SortOptions
  page: number
}

const sortOptions = [
  { label: "Sort by: Newest", value: "created_at" },
  { label: "Sort by: Price Low to High", value: "price_asc" },
  { label: "Sort by: Price High to Low", value: "price_desc" },
]

const SortDropdown = ({ query, sortBy = "created_at", page }: SortDropdownProps) => {
  const handleSortChange = (value: SortOptions) => {
    window.location.href = `/search?query=${encodeURIComponent(query)}&sortBy=${value}&page=${page}`
  }

  return (
    <Listbox value={sortBy} onChange={handleSortChange}>
      <div className="relative">
        <Listbox.Button className="border border-grey-20 text-heading text-[13px] md:text-sm font-semibold relative w-full py-2 ltr:pl-3 rtl:pr-3 ltr:pr-10 rtl:pl-10 ltr:text-left rtl:text-right bg-white rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm cursor-pointer">
          <span className="block truncate">
            {sortOptions.find((option) => option.value === sortBy)?.label || "Sorting Options"}
          </span>
          <span className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center ltr:pr-2 rtl:pl-2 pointer-events-none">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-5 h-5 text-grey-40"
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
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {sortOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 ltr:pl-3 rtl:pr-3 ltr:pr-4 rtl:pl-4 ${
                    active ? "bg-grey-5 text-heading" : "text-body"
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