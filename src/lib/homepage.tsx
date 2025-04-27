"use server";

import { listCollections } from "@lib/data/collections";
import { listProducts } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import { HttpTypes } from "@medusajs/types";
import Container from "@modules/common/components/container";
import PopularCollectionBlock from "@modules/home/components/popular-collection-block";
import SaleBannerGrid from "@modules/home/components/sale-banner-grid";
import NewArrivalsProductFeed from "@modules/home/components/new-arrivals-product-feed";
import ProductsFlashSaleBlock from "@modules/home/components/products-flash-sale-block";
import Subscription from "@modules/common/components/subscription";
import { collectionData, collectionDataNew } from "@lib/data/home-collection";

const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase();
const DEFAULT_REGION_ID = "reg_01JSW66RFBTQRDR1PX0A3MQJP8";

export async function renderHomepage() {
  const currentDate = new Date().toISOString();

  // 1) Determine region
  let region: HttpTypes.StoreRegion;
  try {
    const fetched = await getRegion();
    region = fetched ?? {
      id: DEFAULT_REGION_ID,
      currency_code: "USD",
      name: "Default Region",
    };
    console.log("Region fetched in homepage:", region);
  } catch (e: any) {
    console.error("getRegion failed in homepage:", { message: e.message, stack: e.stack });
    region = {
      id: DEFAULT_REGION_ID,
      currency_code: "USD",
      name: "Default Region",
    };
  }

  // 2) Collections
  let collections: HttpTypes.StoreCollection[] = [];
  try {
    const { collections: cols } = await listCollections({
      fields: "id, handle, title, metadata, thumbnail",
    });
    collections = cols ?? [];
    console.log("Collections fetched:", collections);
  } catch (e: any) {
    console.error("listCollections failed:", { message: e.message, stack: e.stack });
  }

  // 3) New Arrivals
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString();

  let newArrivalsProducts: HttpTypes.StoreProduct[] = [];
  let newArrivalsError: { message: string } | null = null;

  try {
    console.log("Fetching new arrivals with region ID:", region.id);
    const { response } = await listProducts({
      countryCode: DEFAULT_COUNTRY,
      regionId: region.id,
      queryParams: {
        limit: 10,
        created_at: { gte: thirtyDaysAgoISOString },
      },
    });
    newArrivalsProducts = response.products || [];
    console.log("New Arrivals Products:", newArrivalsProducts);

    if (newArrivalsProducts.length === 0) {
      console.log("No new arrivals found, trying fallback...");
      const { response: fallback } = await listProducts({
        countryCode: DEFAULT_COUNTRY,
        regionId: region.id,
        queryParams: { limit: 10 },
      });
      newArrivalsProducts = fallback.products || [];
      console.log("Fallback Products:", newArrivalsProducts);
    }
  } catch (e: any) {
    console.error("listProducts(new arrivals) failed:", {
      message: e.message,
      stack: e.stack,
      regionId: region.id,
      countryCode: DEFAULT_COUNTRY,
      queryParams: { limit: 10, created_at: { gte: thirtyDaysAgoISOString } },
    });
    newArrivalsError = { message: e.message };
  }

  // 4) Flash Sale
  let flashSaleProducts: HttpTypes.StoreProduct[] = [];
  let flashSaleError: { message: string } | null = null;

  try {
    console.log("Fetching flash sale with region ID:", region.id);
    const { response } = await listProducts({
      countryCode: DEFAULT_COUNTRY,
      regionId: region.id,
      queryParams: {
        limit: 10,
        tag_id: ["flash-sale"],
      },
    });
    flashSaleProducts = response.products || [];
    console.log("Flash Sale Products:", flashSaleProducts);

    if (flashSaleProducts.length === 0) {
      console.log("No flash sale products found, trying fallback...");
      const { response: fallback } = await listProducts({
        countryCode: DEFAULT_COUNTRY,
        regionId: region.id,
        queryParams: { limit: 10 },
      });
      flashSaleProducts = fallback.products || [];
      console.log("Flash Sale Fallback Products:", flashSaleProducts);
    }
  } catch (e: any) {
    console.error("listProducts(flash sale) failed:", {
      message: e.message,
      stack: e.stack,
      regionId: region.id,
      countryCode: DEFAULT_COUNTRY,
      queryParams: { limit: 10, tag_id: ["flash-sale"] },
    });
    flashSaleError = { message: e.message };
  }

  // 5) Render
  return (
    <Container>
      <div className="py-12">
        <PopularCollectionBlock
          data={collectionDataNew}
          variant="trendy"
          layout="cols-4"
        />

        <SaleBannerGrid />

        <NewArrivalsProductFeed
          products={newArrivalsProducts}
          isLoading={false}
          error={newArrivalsError}
          region={region}
        />

        <PopularCollectionBlock
          data={collectionData}
          variant="full"
          layout="cols-2"
        />

        <ProductsFlashSaleBlock
          products={flashSaleProducts}
          isLoading={false}
          error={flashSaleError}
          date={currentDate}
          variant="slider"
          region={region}
        />

        <Subscription
          className="relative px-5 overflow-hidden sm:px-8 md:px-16 2xl:px-24 sm:items-center lg:items-start"
          variant="modern"
        />
      </div>
    </Container>
  );
}