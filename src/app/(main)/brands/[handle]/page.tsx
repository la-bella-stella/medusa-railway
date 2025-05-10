
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import ProductResultsPage from "@modules/search/templates/search-results-template"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

export async function generateStaticParams() {
  const { collections } = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/collections`,
    { headers: { "Content-Type": "application/json" } }
  ).then((res) => res.json())

  return (
    collections?.map((collection: HttpTypes.StoreCollection) => ({
      handle: collection.handle,
    })) || []
  )
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string }
}): Promise<Metadata> {
  const productCollection = await getCollectionByHandle(params.handle)
  if (!productCollection) return notFound()

  const title = `${productCollection.title} | Medusa Store`
  const description =
    (typeof productCollection.metadata?.description === "string" ? productCollection.metadata.description : null) ||
    `Explore the ${productCollection.title} collection`

  return {
    title,
    description,
    alternates: { canonical: `brands/${params.handle}` },
  }
}

type BrandPageProps = {
  params: { handle: string }
  searchParams: Promise<{ sortBy?: SortOptions }>
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { handle } = params
  const { sortBy } = await searchParams

  const productCollection = await getCollectionByHandle(handle)
  if (!productCollection) return notFound()

  const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase()
  const region = await getRegion(DEFAULT_COUNTRY)
  const countryCode = region?.countries?.[0]?.iso_2?.toLowerCase() ?? DEFAULT_COUNTRY

  return (
    <ProductResultsPage
      collectionHandle={handle}
      title={productCollection.title}
      sortBy={sortBy}
      countryCode={countryCode}
    />
  )
}
