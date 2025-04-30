import { Metadata } from "next";
import Container from "@modules/common/components/container";
import Subscription from "@modules/common/components/subscription";
import Divider from "@modules/common/components/divider";
import { cookies } from "next/headers";
import { listRegions } from "@lib/data/regions";
import { listCategories } from "@lib/data/categories";
import type { HttpTypes } from "@medusajs/types";
import SearchPageClient from "./search-page-client";
import type { Filters } from "types/global";

const DEFAULT_REGION_CODE = "us";

interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  collection?: string;
  grouped_color?: string;
  gender?: string;
  season?: string;
  price?: string;
  tags?: string;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Search | Medusa Store",
    description: "Search products",
  };
}

async function fetchValidCategories(): Promise<Record<string, string>> {
  try {
    const product_categories = await listCategories();
    const categoryMap: Record<string, string> = {};
    product_categories.forEach((cat: HttpTypes.StoreProductCategory) => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
      if (cat.handle) {
        categoryMap[cat.handle.toLowerCase()] = cat.id;
      }
    });
    return categoryMap;
  } catch (err) {
    return {};
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams;

  const filters: Filters = {
    category: query.category ? query.category.split(",") : [],
    brand: query.brand ? query.brand.split(",") : [],
    collection: query.collection ? query.collection.split(",") : [],
    grouped_color: query.grouped_color ? query.grouped_color.split(",") : [],
    gender: query.gender ? query.gender.split(",") : [],
    season: query.season ? query.season.split(",") : [],
    price: query.price ? [query.price] : [],
    tags: query.tags ? query.tags.split(",") : [],
  };

  if (filters.price?.length) {
    const [min, max] = filters.price[0].split("-").map((v) => v.trim());
    if (!min || !max || isNaN(Number(min)) || isNaN(Number(max))) {
      filters.price = [];
    }
  }

  const regions = await listRegions();

  const cookieStore = await cookies();
  const regionCode = cookieStore.get("region_code")?.value || DEFAULT_REGION_CODE;

  const usdRegion =
    regions.find((r) =>
      r.countries?.some((c) => c.iso_2?.toUpperCase() === "US")
    ) ??
    regions.find((r) => r.currency_code === "USD");

  let region: HttpTypes.StoreRegion | null =
    usdRegion ??
    regions.find((r) =>
      r.countries?.some((c) => c.iso_2?.toUpperCase() === regionCode.toUpperCase())
    ) ??
    regions[0] ??
    null;

  if (!region) {
    region = {
      id: "reg_default",
      name: "Default Region",
      currency_code: "USD",
      countries: [{ iso_2: "us", name: "United States" }],
    } as HttpTypes.StoreRegion;
  }

  const countryCode = region?.countries?.[0]?.iso_2?.toLowerCase() ?? "us";

  const categoryMap = await fetchValidCategories();
  filters.category = (filters.category || []).map((cat) => {
    const catLower = cat.toLowerCase();
    return categoryMap[catLower] || cat;
  }).filter((cat) => Object.values(categoryMap).includes(cat));
  filters.brand = [];

  return (
    <>
      <Divider className="mb-2" />
      <Container>
        <div className="flex pt-8 pb-16 lg:pb-20">
          <SearchPageClient
            region={region}
            countryCode={countryCode}
            filters={filters}
          />
        </div>
        <Subscription />
      </Container>
    </>
  );
}