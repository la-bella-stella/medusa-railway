import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryByHandle, listCategories } from "@lib/data/categories";
import { getRegion, listRegions } from "@lib/data/regions";
import { listProducts } from "@lib/data/products"; // Added import
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
  } catch (error) {
    notFound();
  }
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sortBy, page, category, brand, collection, grouped_color, gender, season, price, tags } = searchParams;

  const productCategory = await getCategoryByHandle(params.category);
  if (!productCategory) notFound();

  console.log("Category ID:", productCategory.id); // Debug category ID

  const regions = await listRegions();
  const countryCode = regions?.[0]?.countries?.[0]?.iso_2 || "us";
  let region: HttpTypes.StoreRegion;
  try {
    region = await getRegion(countryCode) || {
      id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8", // Default region ID
      currency_code: "USD",
      name: "Default Region",
    };
  } catch (error) {
    console.error("Failed to fetch region:", error);
    region = {
      id: "reg_01JSW66RFBTQRDR1PX0A3MQJP8",
      currency_code: "USD",
      name: "Default Region",
    };
  }

  // Build filters from searchParams
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

  if (filters.price?.length) {
    const [min, max] = filters.price[0].split("-").map((v) => v.trim());
    if (!min || !max || isNaN(Number(min)) || isNaN(Number(max))) {
      filters.price = [];
    }
  }

  // Fetch filter data server-side using fetch
  let filterData: {
    tags: any[];
    categories: HttpTypes.StoreProductCategory[];
    collections: any[];
    brands: { id: string; name: string; slug: string }[];
    colors: { id: string; value: string; meta: string }[];
  } = {
    tags: [],
    categories: [],
    collections: [],
    brands: [],
    colors: [],
  };

  try {
    const tagsResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-tags?limit=100`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    if (!tagsResponse.ok) throw new Error(`Tags API failed: ${tagsResponse.statusText}`);
    const tagsData = await tagsResponse.json();
    filterData.tags = tagsData.product_tags || [];
    console.log("Tags fetched:", filterData.tags.length); // Debug tags

    filterData.categories = (await listCategories()) || [];
    console.log("Categories fetched:", filterData.categories.length); // Debug categories

    const collectionsResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/collections?limit=100`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    if (!collectionsResponse.ok) throw new Error(`Collections API failed: ${collectionsResponse.statusText}`);
    const collectionsData = await collectionsResponse.json();
    filterData.collections = collectionsData.collections || [];
    console.log("Collections fetched:", filterData.collections.length); // Debug collections

    // Fetch brands
    const brandsResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products?limit=100&fields=metadata`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    if (!brandsResponse.ok) throw new Error(`Brands API failed: ${brandsResponse.statusText}`);
    const brandsData = await brandsResponse.json();
    const brandSet = new Set<string>(
      brandsData.products
        .filter((p: any) => p.metadata?.brand)
        .map((p: any) => JSON.stringify({
          id: p.metadata.brand,
          name: p.metadata.brand,
          slug: p.metadata.brand.toLowerCase().replace(/\s+/g, "-"),
        }))
    );
    filterData.brands = Array.from(brandSet, (item: string) => JSON.parse(item));
    console.log("Brands fetched:", filterData.brands.length); // Debug brands

    // Fetch colors
    const colorsResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-tags?limit=100`,
      { headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } }
    );
    if (!colorsResponse.ok) throw new Error(`Colors API failed: ${colorsResponse.statusText}`);
    const colorsData = await colorsResponse.json();
    filterData.colors = colorsData.product_tags
      .filter((tag: any) => tag.value.startsWith("COLOR_"))
      .map((tag: any) => ({
        id: tag.id,
        value: tag.value.replace("COLOR_", ""),
        meta: tag.metadata?.hex || "#000000",
      }));
    console.log("Colors fetched:", filterData.colors.length); // Debug colors
  } catch (error) {
    console.error("Failed to fetch filter data:", error);
  }

  // Fetch products using listProducts
  let products: HttpTypes.StoreProduct[] = [];
  let count: number = 0;
  try {
    const queryParams: any = {
      limit: 12,
      offset: (parseInt(page || "1") - 1) * 12,
      order: sortBy || "created_at",
      category_id: [productCategory.id],
    };

    // Apply filters
    if (filters.brand?.length) queryParams["metadata[brand]"] = filters.brand.join(",");
    if (filters.collection?.length) queryParams.collection_id = filters.collection;
    if (filters.grouped_color?.length) queryParams.tags = filters.grouped_color.map((c) => `COLOR_${c}`);
    if (filters.gender?.length) queryParams["metadata[gender]"] = filters.gender.join(",");
    if (filters.season?.length) queryParams["metadata[season]"] = filters.season.join(",");
    if (filters.tags?.length) queryParams.tags = (queryParams.tags || []).concat(filters.tags);
    if (filters.price?.length) {
      const [min, max] = filters.price[0].split("-").map(Number);
      queryParams.min_price = min;
      queryParams.max_price = max;
    }

    const { response } = await listProducts({
      countryCode,
      regionId: region.id,
      queryParams,
    });

    products = response.products || [];
    count = response.count || 0;
    console.log("Products fetched:", products.length, "Count:", count); // Debug products

    // Map products to include expected fields for ProductCard
    products = products.map((product: HttpTypes.StoreProduct) => ({
      ...product,
      brand: product.metadata?.brand ? { name: String(product.metadata.brand) } : undefined,
      type: product.type ?? null,
      handle: product.handle || "",
      subtitle: product.subtitle ?? null,
      description: product.description ?? null,
      material: (product.metadata?.materials as string) ?? null,
      origin_country: (product.metadata?.origin as string) ?? null,
      metadata: {
        season: (product.metadata?.season as string) ?? null,
        gender: (product.metadata?.gender as string) ?? null,
        msrp: product.variants?.[0]?.metadata?.msrp ?? undefined,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

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