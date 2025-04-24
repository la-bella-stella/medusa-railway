// src/app/(main)/[handle]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { listProducts } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import ProductTemplate from "@modules/products/templates";
import { HttpTypes } from "@medusajs/types";

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

type Params = { handle: string };

export async function generateStaticParams(): Promise<Params[]> {
  // Fetch handles using the default country
  const { response } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { fields: "handle", limit: "100" } as unknown as
      HttpTypes.FindParams & HttpTypes.StoreProductParams,
  });

  return response.products
    .map((p) => ({ handle: p.handle! }))
    .filter((p) => Boolean(p.handle));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = params;

  // Fetch single product by handle
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
    title: `${product.title} | Medusa Store`,
    description: product.title,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: product.title,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = params;

  // Resolve region via cookie/default
  const region = await getRegion();
  if (!region) {
    notFound();
  }

  // Fetch product by handle
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
