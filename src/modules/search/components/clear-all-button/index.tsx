"use client"

import { useClearRefinements } from "react-instantsearch-hooks-web"

const ClearAllButton = () => {
  const { refine } = useClearRefinements()

  const handleClearAll = () => {
    refine()
  }

  return (
    <button
      className="text-sm text-gray-600 hover:text-gray-800 font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
      aria-label="Clear all filters"
      onClick={handleClearAll}
    >
      Clear All
    </button>
  )
}

export default ClearAllButton