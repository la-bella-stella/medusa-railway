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
  } catch (e: any) {
    console.error("getRegion failed in homepage:", { message: e.message });
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
  } catch (e: any) {
    console.error("listCollections failed:", { message: e.message });
  }

  // 3) Helper function to fetch products
  async function fetchProducts(queryParams: any) {
    try {
      const { response } = await listProducts({
        countryCode: DEFAULT_COUNTRY,
        regionId: region.id,
        queryParams,
      });
      const products = response.products || [];
      console.log("Fetched products:", products.length);
      return products;
    } catch (e: any) {
      console.error("listProducts failed:", {
        message: e.message,
        regionId: region.id,
        queryParams,
      });
      return [];
    }
  }

  // 4) New Arrivals
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString().split("T")[0] + "T00:00:00.000Z";

  let newArrivalsProducts: HttpTypes.StoreProduct[] = [];
  newArrivalsProducts = await fetchProducts({
    limit: 10,
    created_at: { gte: thirtyDaysAgoISOString },
  });
  if (newArrivalsProducts.length === 0) {
    console.log("No new arrivals found, trying fallback...");
    newArrivalsProducts = await fetchProducts({
      limit: 10,
    });
    if (newArrivalsProducts.length === 0) {
      console.warn("No products found for new arrivals, even after fallback.");
    }
  }

  // 5) Flash Sale
  let flashSaleProducts: HttpTypes.StoreProduct[] = [];
  flashSaleProducts = await fetchProducts({
    limit: 10,
    tag_id: ["FLASH SALE"],
  });
  if (flashSaleProducts.length === 0) {
    console.log("No flash sale products found, trying fallback...");
    flashSaleProducts = await fetchProducts({
      limit: 10,
    });
    if (flashSaleProducts.length === 0) {
      console.warn("No products found for flash sale, even after fallback.");
    }
  }

  // 6) Render
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
          error={null}
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
          error={null}
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