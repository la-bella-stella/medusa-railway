"use client"

import { useHits, useSearchBox } from "react-instantsearch-hooks-web"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ShowAllProps = {
  onClose?: () => void
}

const ShowAll = ({ onClose }: ShowAllProps) => {
  const { hits } = useHits()
  const { query } = useSearchBox()
  const width = typeof window !== "undefined" ? window.innerWidth : 0

  if (query.trim() === "") return null
  if (hits.length > 0 && hits.length <= 6) return null

  if (hits.length === 0) {
    return (
      <div
        className="w-full py-4 text-center text-sm text-gray-500"
        data-testid="no-search-results-container"
      >
        No results found.
      </div>
    )
  }

  return (
    <div className="w-full border-t border-gray-100 mt-2">
      <LocalizedClientLink
        href={`/results/${encodeURIComponent(query)}`}
        className="w-full block text-sm md:text-base text-center px-4 py-3 lg:py-3.5 bg-gray-200 text-gray-700 text-opacity-80 hover:text-opacity-100 transition"
        onClick={() => onClose?.()}
      >
        Showing first 6 results – View all
      </LocalizedClientLink>
    </div>
  )
}

export default ShowAll