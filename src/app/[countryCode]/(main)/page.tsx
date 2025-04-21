// src/app/[countryCode]/page.tsx
import { Metadata } from "next";
import { listCollections } from "@lib/data/collections";
import { getRegion } from "@lib/data/regions";
import { listProducts } from "@lib/data/products";
import Hero from "@modules/home/components/hero";
import PopularCollectionBlock from "@modules/home/components/popular-collection-block";
import SaleBannerGrid from "@modules/home/components/sale-banner-grid";
import NewArrivalsProductFeed from "@modules/home/components/new-arrivals-product-feed";

export const metadata: Metadata = {
  title: "Your Store Name",
  description: "A performant ecommerce frontend with Next.js 15 and Medusa.",
};

export default async function Home(props: {
  params: Promise<{ countryCode: string }>;
}) {
  const params = await props.params;
  const { countryCode } = params;

  const region = await getRegion(countryCode);
  const { collections } = await listCollections({
    fields: "id, handle, title, metadata",
  });

  let products = [];
  let error = null;
  let isLoading = false;

  try {
    isLoading = true;
    products = await listProducts({
      limit: 10,
      order_by: "created_at",
      sort_direction: "desc",
      fields: "id, title, handle, thumbnail, type, variants.inventory_quantity, variants.prices", // Include variants.prices
    });
  } catch (e: any) {
    error = { message: e.message || "Failed to fetch products" };
  } finally {
    isLoading = false;
  }

  if (!collections || !region) {
    return null;
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <PopularCollectionBlock collections={collections} variant="trendy" layout="cols-4" />
        <SaleBannerGrid />
        <NewArrivalsProductFeed products={products} isLoading={isLoading} error={error} />
        <PopularCollectionBlock collections={collections} variant="full" layout="cols-2" />
        {/* Other components will go here */}
      </div>
    </>
  );
}