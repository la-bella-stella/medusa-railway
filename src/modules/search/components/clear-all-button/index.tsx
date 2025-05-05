"use client"

import { useRouter } from "next/navigation"

const ClearAllButton = () => {
  const router = useRouter()

  const handleClearAll = () => {
    router.push("/store")
  }

  return (
    <button
      className="flex-shrink text-xs mt-0.5 transition duration-150 ease-in focus:outline-none hover:text-heading"
      aria-label="Clear All"
      onClick={handleClearAll}
    >
      Clear All
    </button>
  )
}

export default ClearAllButton