// src/app/(main)/products/[handle]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { listProducts, getProductByHandle } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import ProductTemplate from "@modules/products/templates";
import { HttpTypes } from "@medusajs/types";

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";
const DEFAULT_REGION_ID = "reg_01JSW66RFBTQRDR1PX0A3MQJP8";

type Params = { handle: string };

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const { response } = await listProducts({
      countryCode: DEFAULT_COUNTRY,
      queryParams: { fields: "handle", limit: 100 },
    });
    return response.products
      .map((p) => ({ handle: p.handle! }))
      .filter((p) => Boolean(p.handle));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const region = await getRegion();
  const regionId = region?.id || DEFAULT_REGION_ID;
  const product = await getProductByHandle(params.handle, regionId);
  if (!product) notFound();
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

export default async function ProductPage({ params }: { params: Params }) {
  // 1. Fetch region
  let region = await getRegion().catch(() => null);
  if (!region) {
    region = {
      id: DEFAULT_REGION_ID,
      currency_code: "USD",
      name: "Default Region",
    } as HttpTypes.StoreRegion;
  }

  // 2. Fetch product
  const product = await getProductByHandle(params.handle, region.id);
  if (!product) notFound();

  // 3. Map to the extra fields ProductTemplate expects
  const mappedProduct: HttpTypes.StoreProduct & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
    handle: string;
    subtitle: string | null;
    description: string | null;
    material: string | null;
    origin_country: string | null;
    metadata?: { season?: string | null; gender?: string | null };
  } = {
    ...product,
    // brand comes from metadata.brand
    brand: product.metadata?.brand
      ? { name: String(product.metadata.brand) }
      : undefined,
    // keep original type if present
    type: product.type ?? null,
    // handle, subtitle, description
    handle: product.handle!,
    subtitle: product.subtitle ?? null,
    description: product.description ?? null,
    // map your custom metafields
    material: (product.metadata?.materials as string) ?? null,
    origin_country: (product.metadata?.origin as string) ?? null,
    metadata: {
      season: (product.metadata?.season as string) ?? null,
      gender: (product.metadata?.gender as string) ?? null,
    },
  };

  // 4. Fetch related products
  const { response: relatedResponse } = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { region_id: region.id, limit: 10 },
  });
  const relatedProducts = relatedResponse.products.filter(
    (p) =>
      p.id !== product.id &&
      (!product.collection_id || p.collection_id === product.collection_id) &&
      !p.is_giftcard
  );

  return (
    <ProductTemplate
      product={mappedProduct}
      region={region}
      countryCode={DEFAULT_COUNTRY}
      relatedProducts={relatedProducts}
    />
  );
}
