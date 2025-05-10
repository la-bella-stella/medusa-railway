"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "@medusajs/icons"
import MobileFilters from "../mobile-filter-sidebar"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type MobileFilterToggleProps = {
  sortBy?: SortOptions
  search?: boolean
}

const MobileFilterToggle = ({ sortBy, search }: MobileFilterToggleProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const toggleFilters = () => setIsOpen((prev) => !prev)

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return

    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const first = focusable?.[0]
    const last = focusable?.[focusable.length - 1]

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeydown)
    first?.focus()

    return () => {
      document.removeEventListener("keydown", handleKeydown)
    }
  }, [isOpen])

  // Close on outside click + lock scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("click", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <>
      <button
        className="lg:hidden text-gray-700 text-sm px-4 py-2 font-semibold border border-gray-200 rounded-md flex items-center transition hover:bg-gray-50"
        onClick={toggleFilters}
        aria-label="Open Filters"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18px"
          height="14px"
          viewBox="0 0 18 14"
          className="ltr:mr-2.5 rtl:ml-2.5"
        >
          <g transform="translate(-925 -1122.489)">
            <path d="M942.581,1295.564H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1295.564,942.581,1295.564Z" transform="translate(0 -169.575)" fill="currentColor" />
            <path d="M942.581,1951.5H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1951.5,942.581,1951.5Z" transform="translate(0 -816.512)" fill="currentColor" />
            <path d="M1163.713,1122.489a2.5,2.5,0,1,0,1.768.732A2.483,2.483,0,0,0,1163.713,1122.489Z" transform="translate(-233.213)" fill="currentColor" />
            <path d="M2344.886,1779.157a2.5,2.5,0,1,0,.731,1.768A2.488,2.488,0,0,0,2344.886,1779.157Z" transform="translate(-1405.617 -646.936)" fill="currentColor" />
          </g>
        </svg>
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleFilters} />
          <div
            ref={modalRef}
            className="relative z-50 bg-white w-full h-full max-h-screen overflow-y-auto p-4 pt-safe pb-28 pt-20"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Filters"
          >

            <MobileFilters sortBy={sortBy} />

            <div className="fixed bottom-0 left-0 right-0 bg-white z-50 border-t border-gray-200 px-4 py-4 flex justify-between items-center">
              <button
                onClick={toggleFilters}
                className="text-sm text-gray-600 font-medium"
              >
                Close
              </button>
              <button
                onClick={toggleFilters}
                className="px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileFilterToggle
