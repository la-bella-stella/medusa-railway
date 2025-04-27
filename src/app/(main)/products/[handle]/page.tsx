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
      queryParams: {
        fields: "handle",
        limit: 100,
      },
    });
    console.log("generateStaticParams - Fetched products:", response.products.length);
    return response.products
      .map((p) => ({ handle: p.handle! }))
      .filter((p) => Boolean(p.handle));
  } catch (e: any) {
    console.error("generateStaticParams - Failed to fetch products:", e.message, e.stack);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { handle } = params;
  console.log("generateMetadata - Fetching product with handle:", handle);

  try {
    const region = await getRegion();
    const regionId = region?.id || DEFAULT_REGION_ID;
    const product = await getProductByHandle(handle, regionId);
    console.log("generateMetadata - Product fetch response:", JSON.stringify(product, null, 2));

    if (!product) {
      console.log("generateMetadata - No product found for handle:", handle);
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
  } catch (e: any) {
    console.error("generateMetadata - Failed to fetch product:", {
      handle,
      message: e.message,
      stack: e.stack,
    });
    notFound();
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = params;
  console.log("ProductPage - Fetching product with handle:", handle);

  let region: HttpTypes.StoreRegion | null = null;
  try {
    region = await getRegion();
    console.log("ProductPage - Region fetched:", region);
    if (!region) {
      console.warn("ProductPage - No region found, using default region");
      region = {
        id: DEFAULT_REGION_ID,
        currency_code: "USD",
        name: "Default Region",
      } as HttpTypes.StoreRegion;
    }
  } catch (e: any) {
    console.error("ProductPage - getRegion failed:", e.message, e.stack);
    region = {
      id: DEFAULT_REGION_ID,
      currency_code: "USD",
      name: "Default Region",
    } as HttpTypes.StoreRegion;
  }

  try {
    const product = await getProductByHandle(handle, region.id);
    console.log("ProductPage - Product fetch response:", JSON.stringify(product, null, 2));

    if (!product) {
      console.log("ProductPage - No product found for handle:", handle);
      notFound();
    }

    // Fetch related products
    const { response: relatedResponse } = await listProducts({
      queryParams: {
        region_id: region.id,
        limit: 10,
      },
      countryCode: DEFAULT_COUNTRY,
    });
    console.log("ProductPage - Related products response:", JSON.stringify(relatedResponse, null, 2));

    const relatedProducts = relatedResponse.products.filter(
      (p) =>
        p.id !== product.id &&
        (!product.collection_id || p.collection_id === product.collection_id) &&
        (!product.tags ||
          p.tags?.some((t) => product.tags!.map((pt) => pt.id).includes(t.id))) &&
        !p.is_giftcard
    );

    return (
      <ProductTemplate
        product={product}
        region={region}
        countryCode={DEFAULT_COUNTRY}
        relatedProducts={relatedProducts}
      />
    );
  } catch (e: any) {
    console.error("ProductPage - Product fetch failed:", {
      handle,
      regionId: region.id,
      message: e.message,
      stack: e.stack,
    });
    notFound();
  }
}