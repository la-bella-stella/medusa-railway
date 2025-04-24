// src/lib/homepage.tsx
"use server"

import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Container from "@modules/common/components/container"
import PopularCollectionBlock from "@modules/home/components/popular-collection-block"
import SaleBannerGrid from "@modules/home/components/sale-banner-grid"
import NewArrivalsProductFeed from "@modules/home/components/new-arrivals-product-feed"
import ProductsFlashSaleBlock from "@modules/home/components/products-flash-sale-block"
import Subscription from "@modules/common/components/subscription"
import { collectionData, collectionDataNew } from "@lib/data/home-collection"

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export async function renderHomepage() {
  const regionId = "reg_01JS7PSQKQNHGZABRPR6FN5XQ4"
  const currentDate = new Date().toISOString()

  // Calculate date 30 days ago for recent products
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString()

  // Fetch region data to ensure consistency
  let region: HttpTypes.StoreRegion | null = null
  try {
    region = await getRegion()
    if (!region) {
      console.error("Failed to fetch region data")
      region = null
    } else {
      console.log("Fetched Region:", JSON.stringify(region, null, 2))
      if (region.id !== regionId) {
        console.warn(`Region ID mismatch: Expected ${regionId}, but fetched region has ID ${region.id}`)
      }
      if (region.currency_code !== "USD") {
        console.warn(`Region currency mismatch: Expected USD, but region has ${region.currency_code}`)
      }
    }
  } catch (e: any) {
    console.error("❌ getRegion failed:", e.message, e.stack)
  }

  // 1) Collections
  let collections: HttpTypes.StoreCollection[] = []
  try {
    const { collections: cols } = await listCollections({
      fields: "id, handle, title, metadata, thumbnail",
    })
    if (!cols || cols.length === 0) {
      console.warn("No collections found, using empty array")
    } else {
      collections = cols
    }
    console.log("Collections:", JSON.stringify(collections, null, 2))
  } catch (e: any) {
    console.error(
      "❌ listCollections failed:",
      e.message,
      e.stack,
      JSON.stringify(e.response?.data || {})
    )
  }

  // 2) New Arrivals - First attempt to fetch recent products
  let newArrivalsProducts: HttpTypes.StoreProduct[] = []
  let newArrivalsError: { message: string } | null = null
  try {
    // First attempt: Fetch products created in the last 30 days
    const { response } = await listProducts({
      queryParams: {
        limit: 10,
        created_at: { gte: thirtyDaysAgoISOString },
      },
      countryCode: DEFAULT_COUNTRY,
    })
    newArrivalsProducts = response.products || []
    console.log(
      "New Arrivals Products (Recent):",
      JSON.stringify(newArrivalsProducts, null, 2)
    )

    // Enhanced debug logging for variant data
    console.log(
      "New Arrivals Variant Details (Recent):",
      newArrivalsProducts.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants?.map((v: any) => ({
          id: v.id,
          calculated_price: v.calculated_price,
          inventory_quantity: v.inventory_quantity,
          prices: v.prices,
        })),
      }))
    )

    // If no recent products are found, fall back to fetching any products
    if (!newArrivalsProducts.length) {
      console.log("No recent products found, falling back to any products")
      const { response: fallbackResponse } = await listProducts({
        queryParams: {
          limit: 10,
        },
        countryCode: DEFAULT_COUNTRY,
      })
      newArrivalsProducts = fallbackResponse.products || []
      console.log(
        "New Arrivals Products (Fallback):",
        JSON.stringify(newArrivalsProducts, null, 2)
      )
      console.log(
        "New Arrivals Variant Details (Fallback):",
        newArrivalsProducts.map((p) => ({
          id: p.id,
          title: p.title,
          variants: p.variants?.map((v: any) => ({
            id: v.id,
            calculated_price: v.calculated_price,
            inventory_quantity: v.inventory_quantity,
            prices: v.prices,
          })),
        }))
      )
    }
  } catch (e: any) {
    console.error(
      "❌ listProducts(new arrivals) failed:",
      e.message,
      e.stack,
      JSON.stringify(e.response?.data || {})
    )
    newArrivalsError = { message: e.message || "Failed to fetch new arrivals" }
  }

  // 3) Flash Sale
  let flashSaleProducts: HttpTypes.StoreProduct[] = []
  let flashSaleError: { message: string } | null = null
  try {
    const { response } = await listProducts({
      queryParams: {
        limit: 10,
        tag_id: ["flash-sale"],
      },
      countryCode: DEFAULT_COUNTRY,
    })
    flashSaleProducts = response.products || []
    console.log("Flash Sale Products:", JSON.stringify(flashSaleProducts, null, 2))
    console.log(
      "Flash Sale Variant Details:",
      flashSaleProducts.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants?.map((v: any) => ({
          id: v.id,
          calculated_price: v.calculated_price,
          inventory_quantity: v.inventory_quantity,
          prices: v.prices,
        })),
      }))
    )
  } catch (e: any) {
    console.error(
      "❌ listProducts(flash sale) failed:",
      e.message,
      e.stack,
      JSON.stringify(e.response?.data || {})
    )
    flashSaleError = { message: e.message || "Failed to fetch flash sale products" }
  }

  console.log({
    collections: collections.length,
    newArrivalsProducts: newArrivalsProducts.length,
    newArrivalsError,
    flashSaleProducts: flashSaleProducts.length,
    flashSaleError,
  })

  try {
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
            products={newArrivalsProducts || []}
            isLoading={newArrivalsProducts.length === 0 && !newArrivalsError}
            error={newArrivalsError}
            region={region}
          />
          <PopularCollectionBlock
            data={collectionData}
            variant="full"
            layout="cols-2"
          />
          <ProductsFlashSaleBlock
            products={flashSaleProducts || []}
            isLoading={false}
            error={flashSaleError}
            date={currentDate}
            variant="slider"
          />
          <Subscription
            className="relative px-5 overflow-hidden sm:px-8 md:px-16 2xl:px-24 sm:items-center lg:items-start"
            variant="modern"
          />
        </div>
      </Container>
    )
  } catch (e: any) {
    console.error("❌ renderHomepage rendering failed:", e.message, e.stack)
    return (
      <Container>
        <div className="py-12">
          <div>Error rendering homepage: {e.message}</div>
        </div>
      </Container>
    )
  }
}