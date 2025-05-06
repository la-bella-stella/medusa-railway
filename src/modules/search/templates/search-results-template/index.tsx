"use client"

import {
  InstantSearch,
  useInfiniteHits,
  useSearchBox,
  Configure,
} from "react-instantsearch-hooks-web"
import { useEffect } from "react"
import { searchClient, SEARCH_INDEX_NAME } from "@lib/search-client"
import FiltersSidebar from "@modules/search/components/filter-sidebar"
import MobileFilterToggle from "@modules/search/components/mobile-filter-toggle"
import SortDropdown from "@modules/search/components/sort-dropdown"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type SearchResultsPageProps = {
  query: string
  sortBy?: SortOptions
  page?: string
  countryCode: string
}

const InjectQuery = ({ query }: { query: string }) => {
  const { refine } = useSearchBox()

  useEffect(() => {
    if (query) {
      refine(query)
    }
  }, [query, refine])

  return null
}

const ProductsWithInfiniteHits = ({
  sortBy,
  countryCode,
}: {
  sortBy?: SortOptions
  countryCode: string
}) => {
  const { hits, showMore, isLastPage } = useInfiniteHits()

  if (!hits.length) {
    return <p className="col-span-full text-center text-sm text-gray-500">No results found.</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
        <PaginatedProducts hits={hits} sortBy={sortBy} page={1} countryCode={countryCode} />
      </div>
      {!isLastPage && (
        <div className="pt-8 text-center mx-auto">
          <button
            onClick={showMore}
            className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md focus:outline-none h-11 md:h-12 px-5 bg-heading text-white py-2 hover:text-white hover:bg-gray-600 hover:shadow-cart"
          >
            Load More
          </button>
        </div>
      )}
    </>
  )
}

const SearchResultsPage = ({
  query,
  sortBy,
  countryCode,
}: SearchResultsPageProps) => {
  return (
    <InstantSearch indexName={SEARCH_INDEX_NAME} searchClient={searchClient}>
      <InjectQuery query={query} />
      <Configure hitsPerPage={9} />

      <div className="content-container">
        <div className="flex pt-8 pb-16 lg:pb-20">
          <FiltersSidebar sortBy={sortBy} search />
          <div className="w-full lg:ml-8">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h1 className="text-2xl font-bold hidden lg:block">Search Results</h1>
              <MobileFilterToggle sortBy={sortBy} search />
              <div className="flex items-center gap-x-4">
                <SortDropdown query={query} sortBy={sortBy} page={1} />
              </div>
            </div>


            <ProductsWithInfiniteHits sortBy={sortBy} countryCode={countryCode} />
          </div>
        </div>
      </div>
    </InstantSearch>
  )
}

export default SearchResultsPage
