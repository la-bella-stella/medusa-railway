"use client"

import {
  InstantSearch,
  useInfiniteHits,
  useSearchBox,
  Configure,
} from "react-instantsearch-hooks-web"
import { searchClient } from "@lib/search-client"
import FiltersSidebar from "@modules/search/components/filter-sidebar"
import MobileFilterToggle from "@modules/search/components/mobile-filter-toggle"
import SortDropdown from "@modules/search/components/sort-dropdown"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { useEffect } from "react"

const SEARCH_INDEX_NAME = "products"

type ProductResultsPageProps = {
  query?: string
  categoryHandle?: string
  collectionHandle?: string
  title: string
  sortBy?: SortOptions
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
        <PaginatedProducts
          hits={hits}
          sortBy={sortBy}
          page={1}
          countryCode={countryCode}
        />
      </div>
      {!isLastPage && (
        <div className="pt-8 text-center mx-auto">
          <button
            onClick={showMore}
            className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md focus:outline-none h-11 md:h-12 px-5 bg-gray-800 text-white py-2 hover:text-white hover:bg-gray-900 hover:shadow-cart"
          >
            Load More
          </button>
        </div>
      )}
    </>
  )
}

const ProductResultsPage = ({
  query,
  categoryHandle,
  collectionHandle,
  title,
  sortBy,
  countryCode,
}: ProductResultsPageProps) => {
  const filters = [
    categoryHandle ? `categories.handle = "${categoryHandle}"` : "",
    collectionHandle ? `collection.handle = "${collectionHandle}"` : "",
  ]
    .filter(Boolean)
    .join(" AND ")

  return (
    <InstantSearch indexName={SEARCH_INDEX_NAME} searchClient={searchClient} routing={true}>
      {query && <InjectQuery query={query} />}
      <Configure
        hitsPerPage={9}
        facets={[
          "categories.handle",
          "categories.name",
          "vendor",
          "color",
          "size",
          "metadata.gender",
          "metadata.season",
          "price",
        ]}
        filters={filters || undefined}
      />

      <div className="content-container">
        <div className="flex pt-8 pb-16 lg:pb-20 relative z-10">
          <FiltersSidebar sortBy={sortBy} search={!!query} />
          <div className="w-full lg:ml-8">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h1 className="text-2xl font-bold hidden lg:block">{title}</h1>
              <MobileFilterToggle sortBy={sortBy} search={!!query} />
              <div className="flex items-center gap-x-4">
                <SortDropdown query={query || ""} sortBy={sortBy} />
              </div>
            </div>

            <ProductsWithInfiniteHits sortBy={sortBy} countryCode={countryCode} />
          </div>
        </div>
      </div>
    </InstantSearch>
  )
}

export default ProductResultsPage
