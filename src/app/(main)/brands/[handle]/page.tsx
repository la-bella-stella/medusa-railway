"use server";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle, listCollections } from "@lib/data/collections";
import { getRegion, listRegions } from "@lib/data/regions";
import { listProducts } from "@lib/data/products";
import BrandPageClient from "./brand-page-client";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { HttpTypes } from "@medusajs/types";
import { Filters } from "types/global";
import { listCategories } from "@lib/data/categories";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{
    sortBy?: SortOptions;
    page?: string;
    category?: string;
    brand?: string;
    collection?: string;
    grouped_color?: string;
    gender?: string;
    season?: string;
    price?: string;
    tags?: string;
  }>;
};

export async function generateStaticParams() {
  try {
    const productCollections = await listCollections();
    console.log("productCollections:", productCollections);
    if (!productCollections || !productCollections.collections) {
      console.warn("No collections found");
      return [];
    }
    const collectionHandles: string[] = productCollections.collections.map(
      (collection: HttpTypes.StoreCollection) => collection.handle
    );
    console.log("collectionHandles:", collectionHandles);
    return collectionHandles.map((handle) => ({ handle }));
  } catch (e) {
    console.error("Error in generateStaticParams:", e);
    return [];
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    console.log("Metadata params.handle:", params.handle);
    const productCollection = await getCollectionByHandle(params.handle);
    console.log("Metadata productCollection:", productCollection);
    if (!productCollection) notFound();
    const title = `${productCollection.title} | Medusa Store`;
    const description = productCollection.metadata?.description || `Explore the ${productCollection.title} collection`;
    return {
      title,
      alternates: { canonical: `brand/${params.handle}` },
    };
  } catch (e) {
    console.error("Error in generateMetadata:", e);
    notFound();
  }
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const {
    sortBy,
    page = "1",
    category,
    brand,
    collection,
    grouped_color,
    gender,
    season,
    price,
    tags,
  } = searchParams;

  console.log("CollectionPage params.handle:", params.handle);
  const productCollection = await getCollectionByHandle(params.handle);
  console.log("CollectionPage productCollection:", productCollection);
  if (!productCollection) notFound();

  // Determine region & country
  const regions = await listRegions();
  const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase();
  const countryCode = regions?.[0]?.countries?.[0]?.iso_2?.toLowerCase() ?? DEFAULT_COUNTRY;
  let region: HttpTypes.StoreRegion;
  try {
    region = (await getRegion(countryCode))!;
  } catch (e) {
    console.error("Error fetching region:", e);
    region = { id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8", currency_code: "USD", name: "Default Region" };
  }

  // Build filters
  const filters: Filters = {
    category: category ? category.split(",") : [],
    brand: brand ? brand.split(",") : [],
    collection: collection ? collection.split(",") : [productCollection.id],
    grouped_color: grouped_color ? grouped_color.split(",") : [],
    gender: gender ? gender.split(",") : [],
    season: season ? season.split(",") : [],
    price: price ? [price] : [],
    tags: tags ? tags.split(",") : [],
  };
  if (filters.price.length) {
    const [min, max] = filters.price[0].split("-").map((v) => v.trim());
    if (isNaN(Number(min)) || isNaN(Number(max))) filters.price = [];
  }

  // Fetch filter data
  let filterData = {
    tags: [] as any[],
    categories: [] as HttpTypes.StoreProductCategory[],
    collections: [] as HttpTypes.StoreCollection[],
    brands: [] as any[], // Placeholder for brands
    colors: [] as { id: string; value: string; meta: string }[],
  };

  try {
    // Tags and reuse for colors
    const tagsRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-tags?limit=100`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    let tagsData: { product_tags?: any[] } = {};
    if (tagsRes.ok) {
      tagsData = await tagsRes.json();
      filterData.tags = tagsData.product_tags || [];
    }

    // Categories
    filterData.categories = (await listCategories()) || [];

    // Collections
    const colsRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/collections?limit=100`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    if (colsRes.ok) {
      const colsData = await colsRes.json();
      filterData.collections = colsData.collections || [];
    }

    // Brands (Placeholder - replace with actual brand fetching logic if needed)
    filterData.brands = []; // Temporary placeholder

    // Colors
    filterData.colors = (tagsData.product_tags || [])
      .filter((tag: any) => tag.value.startsWith("COLOR_"))
      .map((tag: any) => ({
        id: tag.id,
        value: tag.value.replace("COLOR_", ""),
        meta: tag.metadata?.hex || "#000000",
      }));
  } catch (e) {
    console.error("Error fetching filter data:", e);
  }

  // Helper to fetch products and count
  async function fetchProducts(queryParams: Record<string, any>) {
    try {
      const { response } = await listProducts({
        countryCode,
        regionId: region.id,
        queryParams,
      });
      return { products: response.products || [], count: response.count || 0 };
    } catch (e: any) {
      console.error("listProducts error:", e.message, queryParams);
      return { products: [], count: 0 };
    }
  }

  // Build product query
  const limit = 12;
  const offset = (Number(page) - 1) * limit;
  const baseQuery: Record<string, any> = {
    limit,
    offset,
    order: sortBy || "created_at",
    collection_id: [productCollection.id],
  };

  if (filters.collection.length) baseQuery.collection_id = filters.collection;
  if (filters.category.length) baseQuery.category_id = filters.category;
  if (filters.grouped_color.length) baseQuery.tags = filters.grouped_color.map((c) => `COLOR_${c}`);
  if (filters.gender.length) baseQuery["metadata[gender]"] = filters.gender.join(",");
  if (filters.season.length) baseQuery["metadata[season]"] = filters.season.join(",");
  if (filters.tags.length) baseQuery.tags = (baseQuery.tags || []).concat(filters.tags);
  if (filters.price.length) {
    const [min, max] = filters.price[0].split("-").map(Number);
    baseQuery.min_price = min;
    baseQuery.max_price = max;
  }

  // Fetch products and count
  const { products, count } = await fetchProducts(baseQuery);
  if (!products.length && count === 0) {
    console.warn("No products found for query:", baseQuery);
    notFound();
  }

  return (
    <BrandPageClient
      collection={productCollection}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      filterData={filterData}
      products={products}
      region={region}
      totalCount={count}
      filters={filters}
    />
  );
}