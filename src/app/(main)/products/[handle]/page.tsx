// src/app/(main)/products/[handle]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

type Params = { handle: string }

export async function generateStaticParams(): Promise<Params[]> {
  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: {
      fields: "handle",
      limit: 100,
    },
  })

  return response.products
    .map((p) => ({ handle: p.handle! }))
    .filter((p) => Boolean(p.handle))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { handle } = params
  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { handle },
  })

  const product = response.products[0]
  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Your Store Name`,
    description: product.title,
    openGraph: {
      title: `${product.title} | Your Store Name`,
      description: product.title,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = params
  const region = await getRegion()
  if (!region) {
    notFound()
  }

  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { handle },
  })

  const product = response.products[0]
  if (!product) {
    notFound()
  }

  // Fetch related products with minimal parameters to avoid TypeScript errors
  const { response: relatedResponse } = await listProducts({
    queryParams: {
      region_id: region.id,
      limit: 10, // Adjust as needed
    },
    countryCode: DEFAULT_COUNTRY,
  })

  // Filter related products client-side to mimic original logic
  const relatedProducts = relatedResponse.products.filter(
    (p) =>
      p.id !== product.id &&
      // Filter by collection_id if available
      (!product.collection_id || p.collection_id === product.collection_id) &&
      // Filter by tags if available
      (!product.tags ||
        p.tags?.some((t) => product.tags!.map((pt) => pt.id).includes(t.id))) &&
      // Filter out gift cards (if is_giftcard is not supported)
      !p.is_giftcard // Adjust based on your product data structure
  )

  return (
    <ProductTemplate
      product={product}
      region={region}
      countryCode={DEFAULT_COUNTRY}
      relatedProducts={relatedProducts}
    />
  )
}