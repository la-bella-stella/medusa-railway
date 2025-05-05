"use client"

import { useRouter } from "next/navigation"

type LoadMoreButtonProps = {
  query: string
  page: number
}

const LoadMoreButton = ({ query, page }: LoadMoreButtonProps) => {
  const router = useRouter()

  const handleLoadMore = () => {
    const nextPage = page + 1
    router.push(`/search?query=${encodeURIComponent(query)}&page=${nextPage}`)
  }

  return (
    <button
      data-variant="slim"
      className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md focus:outline-none h-11 md:h-12 px-5 bg-heading text-white py-2 hover:text-white hover:bg-gray-600 hover:shadow-cart"
      onClick={handleLoadMore}
    >
      Load More
    </button>
  )
}

export default LoadMoreButton