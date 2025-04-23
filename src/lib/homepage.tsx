// src/lib/homepage.tsx
import { listCollections } from "@lib/data/collections";
import { getRegion } from "@lib/data/regions";
import { listProducts } from "@lib/data/products";
import { HttpTypes } from "@medusajs/types";
import Container from "@modules/common/components/container";
import PopularCollectionBlock from "@modules/home/components/popular-collection-block";
import SaleBannerGrid from "@modules/home/components/sale-banner-grid";
import NewArrivalsProductFeed from "@modules/home/components/new-arrivals-product-feed";
import ProductsFlashSaleBlock from "@modules/home/components/products-flash-sale-block";
import Subscription from "@modules/common/components/subscription";
import { collectionData, collectionDataNew } from "@lib/data/home-collection";

export async function renderHomepage(countryCode: string) {
  const region = await getRegion(countryCode);
  const { collections } = await listCollections({
    fields: "id, handle, title, metadata, thumbnail",
  });

  let newArrivalsProducts: HttpTypes.StoreProduct[] = [];
  let newArrivalsError: { message: string } | null = null;
  let newArrivalsIsLoading = false;

  try {
    newArrivalsIsLoading = true;
    const result = await listProducts({
      countryCode,
      queryParams: {
        limit: 10,
        order: "created_at desc",
        fields: "id, title, handle, thumbnail, type, variants.inventory_quantity, variants.calculated_price_number",
      },
    });
    newArrivalsProducts = result.response.products;
  } catch (e: any) {
    newArrivalsError = { message: e.message || "Failed to fetch new arrivals" };
  } finally {
    newArrivalsIsLoading = false;
  }

  let flashSaleProducts: HttpTypes.StoreProduct[] = [];
  let flashSaleError: { message: string } | null = null;
  let flashSaleIsLoading = false;

  try {
    flashSaleIsLoading = true;
    const result = await listProducts({
      countryCode,
      queryParams: {
        limit: 10,
        tags: ["flash-sale"],
        fields: "id, title, handle, thumbnail, type, variants.inventory_quantity, variants.calculated_price_number",
      },
    });
    flashSaleProducts = result.response.products;
  } catch (e: any) {
    flashSaleError = { message: e.message || "Failed to fetch flash sale products" };
  } finally {
    flashSaleIsLoading = false;
  }

  if (!collections || !region) {
    return null;
  }

  return (
    <Container>
      <div className="py-12">
        <PopularCollectionBlock data={collectionDataNew} variant="trendy" layout="cols-4" />
        <SaleBannerGrid />
        <NewArrivalsProductFeed
          products={newArrivalsProducts}
          isLoading={newArrivalsIsLoading}
          error={newArrivalsError}
        />
        <PopularCollectionBlock data={collectionData} variant="full" layout="cols-2" />
        <ProductsFlashSaleBlock
          products={flashSaleProducts}
          isLoading={flashSaleIsLoading}
          error={flashSaleError}
          date="2025-07-11T05:00:00"
          variant="slider"
        />
        <Subscription
          className="relative px-5 overflow-hidden sm:px-8 md:px-16 2xl:px-24 sm:items-center lg:items-start"
          variant="modern"
        />
      </div>
    </Container>
  );
}