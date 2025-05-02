"use server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryByHandle, listCategories } from "@lib/data/categories";
import { getRegion, listRegions } from "@lib/data/regions";
import { listProducts } from "@lib/data/products";
import CollectionPageClient from "./collection-page-client";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { HttpTypes } from "@medusajs/types";
import { Filters } from "types/global";

type Props = {
  params: Promise<{ category: string[] }>;
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
  const productCategories = await listCategories();
  if (!productCategories) return [];
  const categoryHandles: string[] = productCategories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle
  );
  return categoryHandles.map((handle) => ({ category: [handle] }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const productCategory = await getCategoryByHandle(params.category);
    const title = `${productCategory.name} | Medusa Store`;
    const description = productCategory.description ?? `${title} category.`;
    return {
      title,
      description,
      alternates: { canonical: `collections/${params.category.join("/")}` },
    };
  } catch {
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

  const productCategory = await getCategoryByHandle(params.category);
  if (!productCategory) notFound();

  // Determine region & country
  const regions = await listRegions();
  const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase();
  const countryCode = regions?.[0]?.countries?.[0]?.iso_2?.toLowerCase() ?? DEFAULT_COUNTRY;
  let region: HttpTypes.StoreRegion;
  try {
    region = (await getRegion(countryCode))!;
  } catch {
    region = { id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8", currency_code: "USD", name: "Default Region" };
  }

  // Build filters
  const filters: Filters = {
    category: category ? category.split(",") : [productCategory.id],
    brand: brand ? brand.split(",") : [],
    collection: collection ? collection.split(",") : [],
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
    collections: [] as any[],
    brands: [] as { id: string; name: string; slug: string }[],
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

    // Brands
    const brandsRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products?limit=100&fields=metadata`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    if (brandsRes.ok) {
      const brandsData = await brandsRes.json();
      const set = new Set<string>();
      (brandsData.products || []).forEach((p: any) => {
        if (p.metadata?.brand) {
          set.add(
            JSON.stringify({
              id: p.metadata.brand,
              name: p.metadata.brand,
              slug: p.metadata.brand.toLowerCase().replace(/\s+/g, "-"),
            })
          );
        }
      });
      filterData.brands = Array.from(set).map((s) => JSON.parse(s));
    }

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
    category_id: [productCategory.id],
  };
  if (filters.brand.length) baseQuery["metadata[brand]"] = filters.brand.join(",");
  if (filters.collection.length) baseQuery.collection_id = filters.collection;
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

  return (
    <CollectionPageClient
      category={productCategory}
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
