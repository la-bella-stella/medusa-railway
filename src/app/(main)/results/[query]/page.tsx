import { Metadata } from "next"
import ProductResultsPage from "@modules/search/templates/search-results-template"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Search",
  description: "Explore all of our products.",
}

type SearchResultsProps = {
  params: Promise<{ query: string; countryCode: string }>
  searchParams: Promise<{ sortBy?: SortOptions }>
}

export default async function SearchResults({ params, searchParams }: SearchResultsProps) {
  const { query, countryCode } = await params
  const { sortBy } = await searchParams

  return (
    <ProductResultsPage
      query={query}
      title="Search Results"
      sortBy={sortBy}
      countryCode={countryCode}
    />
  )
}