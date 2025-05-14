"use server";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { listProducts, getProductByHandle } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import { retrieveCollection } from "@lib/data/collections"; // Import collection fetch
import ProductTemplate from "@modules/products/templates";
import { HttpTypes } from "@medusajs/types";

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";
const DEFAULT_REGION_ID = "reg_01JV62N5VTWTWYGTYT91JE39Q1";

type Params = Promise<{ handle: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateStaticParams(): Promise<{ handle: string }[]> {
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
  const { handle } = await params;
  const region = await getRegion();
  const regionId = region?.id || DEFAULT_REGION_ID;
  const product = await getProductByHandle(handle, regionId);
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

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { handle } = await params;
  const { countryCode } = await searchParams;

  let region = await getRegion().catch(() => null);
  if (!region) {
    region = {
      id: DEFAULT_REGION_ID,
      currency_code: "USD",
      name: "Default Region",
    } as HttpTypes.StoreRegion;
  }

  const product = await getProductByHandle(handle, region.id);
  if (!product) notFound();

  // Fetch the associated collection as the brand
  let brand: { name: string; handle: string } | undefined;
  if (product.collection_id) {
    try {
      const collection = await retrieveCollection(product.collection_id);
      if (collection) {
        brand = {
          name: collection.title,
          handle: collection.handle!,
        };
      }
    } catch (e) {
      console.error(`Error fetching collection for product ${handle}:`, e);
    }
  }

  console.log("ProductPage inventory:", {
    handle,
    productId: product.id,
    variants: product.variants
      ? product.variants.map((v) => ({
          id: v.id,
          inventory_quantity: v.inventory_quantity,
          manage_inventory: v.manage_inventory,
          allow_backorder: v.allow_backorder,
        }))
      : "No variants available",
  });

  const mappedProduct: HttpTypes.StoreProduct & {
    brand?: { name: string; handle: string };
    type?: HttpTypes.StoreProductType | null;
    handle: string;
    subtitle: string | null;
    description: string | null;
    material: string | null;
    origin_country: string | null;
    metadata?: { season?: string | null; gender?: string | null };
  } = {
    ...product,
    brand, // Use collection-based brand
    type: product.type ?? null,
    handle: product.handle!,
    subtitle: product.subtitle ?? null,
    description: product.description ?? null,
    material: (product.metadata?.materials as string) ?? null,
    origin_country: (product.metadata?.origin as string) ?? null,
    metadata: {
      season: (product.metadata?.season as string) ?? null,
      gender: (product.metadata?.gender as string) ?? null,
    },
  };

  const { response: relatedResponse } = await listProducts({
    countryCode: countryCode as string || DEFAULT_COUNTRY,
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
      countryCode={countryCode as string || DEFAULT_COUNTRY}
      relatedProducts={relatedProducts}
    />
  );
}