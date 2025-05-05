"use client"

import { useState } from "react"
import FiltersSidebar from "../filter-sidebar"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type MobileFilterToggleProps = {
  sortBy?: SortOptions
  search?: boolean
}

const MobileFilterToggle = ({ sortBy, search }: MobileFilterToggleProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleFilters = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        className="lg:hidden text-heading text-sm px-4 py-2 font-semibold border border-grey-20 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-grey-5"
        onClick={toggleFilters}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18px"
          height="14px"
          viewBox="0 0 18 14"
        >
          <g transform="translate(-925 -1122.489)">
            <path
              d="M942.581,1295.564H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1295.564,942.581,1295.564Z"
              transform="translate(0 -169.575)"
              fill="currentColor"
            />
            <path
              d="M942.581,1951.5H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1951.5,942.581,1951.5Z"
              transform="translate(0 -816.512)"
              fill="currentColor"
            />
            <path
              d="M1163.713,1122.489a2.5,2.5,0,1,0,1.768.732A2.483,2.483,0,0,0,1163.713,1122.489Z"
              transform="translate(-233.213)"
              fill="currentColor"
            />
            <path
              d="M2344.886,1779.157a2.5,2.5,0,1,0,.731,1.768A2.488,2.488,0,0,0,2344.886,1779.157Z"
              transform="translate(-1405.617 -646.936)"
              fill="currentColor"
            />
          </g>
        </svg>
        <span className="ltr:pl-2.5 rtl:pr-2.5">Filters</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto lg:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-heading">Filters</h2>
            <button
              className="text-heading text-sm"
              onClick={toggleFilters}
              aria-label="Close Filters"
            >
              Close
            </button>
          </div>
          <FiltersSidebar sortBy={sortBy} search={search} />
        </div>
      )}
    </>
  )
}

export default MobileFilterToggle