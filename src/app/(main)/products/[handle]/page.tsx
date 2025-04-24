// File: src/app/(main)/products/[handle]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { listProducts } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import ProductTemplate from "@modules/products/templates";
import { HttpTypes } from "@medusajs/types";

// Fallback country for product fetches
const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

type Params = { handle: string };

/**
 * Build the list of all [handle] pages at build time.
 */
export async function generateStaticParams(): Promise<Params[]> {
  // Fetch only the handles (no other data)
  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: {
      fields: "handle",
      limit: 100,
    } as unknown as HttpTypes.FindParams & HttpTypes.StoreProductParams,
  });

  return response.products
    .map((p) => ({ handle: p.handle! }))
    .filter((p) => Boolean(p.handle));
}

/**
 * Generate per-page metadata (title, open graph, etc).
 */
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { handle } = params;

  // Fetch that single product by handle
  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { handle } as unknown as
      HttpTypes.FindParams & HttpTypes.StoreProductParams,
  });

  const product = response.products[0];
  if (!product) {
    notFound();
  }

  return {
    title: `${product.title} | Your Store Name`,
    description: product.title,
    openGraph: {
      title: `${product.title} | Your Store Name`,
      description: product.title,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

/**
 * The actual product page component.
 */
export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = params;

  // Pick up region from cookie or default
  const region = await getRegion();
  if (!region) {
    notFound();
  }

  // Re-fetch the product (so we get prices, variants, etc)
  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { handle } as unknown as
      HttpTypes.FindParams & HttpTypes.StoreProductParams,
  });

  const product = response.products[0];
  if (!product) {
    notFound();
  }

  return (
    <ProductTemplate
      product={product}
      region={region}
      countryCode={DEFAULT_COUNTRY}
    />
  );
}
