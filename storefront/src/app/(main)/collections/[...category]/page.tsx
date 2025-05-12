import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import ProductResultsPage from "@modules/search/templates/search-results-template"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const { product_categories } = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-categories`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    ).then((res) => res.json())

    return (
      product_categories?.map(
        (category: HttpTypes.StoreProductCategory) => ({
          category: [category.handle],
        })
      ) || []
    )
  } catch (error) {
    console.error("Error in generateStaticParams:", error)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { category: string[] }
}): Promise<Metadata> {
  try {
    const productCategory = await getCategoryByHandle(params.category)
    if (!productCategory) return notFound()

    const title = `${productCategory.name} | Medusa Store`
    const description = productCategory.description ?? `${title} category`

    return {
      title,
      description,
      alternates: { canonical: `categories/${params.category.join("/")}` },
    }
  } catch {
    return notFound()
  }
}

type CategoryPageProps = {
  params: { category: string[] }
  searchParams: Promise<{ sortBy?: SortOptions }>
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const categoryHandle = params.category.join("/")
  const { sortBy } = await searchParams

  const productCategory = await getCategoryByHandle(params.category)
  if (!productCategory) return notFound()

  const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase()
  const region = await getRegion(DEFAULT_COUNTRY)
  const countryCode = region?.countries?.[0]?.iso_2?.toLowerCase() ?? DEFAULT_COUNTRY

  return (
    <ProductResultsPage
      categoryHandle={categoryHandle}
      title={productCategory.name}
      sortBy={sortBy}
      countryCode={countryCode}
    />
  )
}