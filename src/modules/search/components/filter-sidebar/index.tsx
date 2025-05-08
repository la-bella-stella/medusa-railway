"use client"

import { RefinementList, RangeInput } from "react-instantsearch-hooks-web"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ClearAllButton from "../clear-all-button"

export type SortOptions = "created_at" | "price_asc" | "price_desc" | "name_asc" | "name_desc"

type FiltersSidebarProps = {
  sortBy?: SortOptions
  search?: boolean
}

const FACETS = [
  { label: "Category", attr: "categories.name" },
  { label: "Brands", attr: "vendor" },
  { label: "Colors", attr: "color" },
  { label: "Size", attr: "size" },
  { label: "Gender", attr: "metadata.gender" },
  { label: "Season", attr: "metadata.season" },
]

const FiltersSidebar = ({ sortBy = "created_at", search = false }: FiltersSidebarProps) => {
  return (
    <div className="hidden lg:block w-96 ltr:pr-24 rtl:pl-24 flex-shrink-0">
      <div className="sticky top-0">
        {/* Breadcrumb */}
        <div className="pb-7">
          <ol className="flex items-center w-full overflow-hidden breadcrumb">
            <li className="text-sm text-body px-2.5 hover:text-heading transition duration-200">
              <LocalizedClientLink href="/">Home</LocalizedClientLink>
            </li>
            <li className="text-base text-body mt-0.5">/</li>
            <li className="text-sm text-body px-2.5 font-semibold text-heading capitalize">
              <LocalizedClientLink href="/search">
                {search ? "Search" : "Products"}
              </LocalizedClientLink>
            </li>
          </ol>
        </div>

        {/* Filter header */}
        <div className="block border-b border-grey-20 pb-7 mb-7">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-semibold text-heading text-xl md:text-2xl">Filters</h2>
            <ClearAllButton />
          </div>
        </div>

        {/* Dynamic Refinement Lists */}
        {FACETS.map(({ label, attr }) => (
          <div key={attr} className="block border-b border-grey-20 pb-7 mb-7">
            <h3 className="text-heading text-sm md:text-base font-semibold mb-3">{label}</h3>
            <RefinementList
              attribute={attr}
              showMore
              classNames={{
                root: "",
                list: "flex flex-col space-y-2 max-h-60 overflow-y-auto pr-1",
                item: "group flex items-center",
                label: "flex items-center cursor-pointer text-sm text-body hover:text-heading transition duration-200 ease-in-out",
                checkbox:
                  "form-checkbox w-4 h-4 border border-grey-20 rounded cursor-pointer transition duration-500 ease-in-out text-heading hover:border-heading checked:bg-heading focus:ring-0 focus:outline-none mr-3",
                count: "text-xs text-grey-40 ml-auto",
              }}
            />
          </div>
        ))}

        {/* Price Range */}
        <div className="block border-b border-grey-20 pb-7 mb-7">
          <h3 className="text-heading text-sm md:text-base font-semibold mb-3">Price</h3>
          <RangeInput
            attribute="price"
            classNames={{
              form: "flex items-center space-x-2",
              input: "w-full p-2 border border-grey-20 rounded text-sm",
              submit:
                "px-4 py-2 bg-heading text-white rounded-md hover:bg-gray-700 transition",
              separator: "mx-2 text-gray-600",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default FiltersSidebar
