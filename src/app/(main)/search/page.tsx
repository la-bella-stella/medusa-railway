// src/app/search/page.tsx
import { Metadata } from "next";
import Container from "@modules/common/components/container";
import Subscription from "@modules/common/components/subscription";
import Divider from "@modules/common/components/divider";
import { cookies } from "next/headers";
import { listRegions } from "@lib/data/regions";
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams;

  // 1) Build the Filters object from the raw strings
  const filters: Filters = {
    category:      query.category      ? query.category.split(",")      : [],
    brand:         query.brand         ? query.brand.split(",")         : [],
    collection:    query.collection    ? query.collection.split(",")    : [],
    grouped_color: query.grouped_color ? query.grouped_color.split(",") : [],
    gender:        query.gender        ? query.gender.split(",")        : [],
    season:        query.season        ? query.season.split(",")        : [],
    price:         query.price         ? [query.price]                  : [],
    tags:          query.tags          ? query.tags.split(",")          : [],
  };

  // 2) Region resolution
  const regions     = await listRegions();
  const cookieStore = await cookies();    // ← await here!
  const regionCode  = cookieStore.get("region_code")?.value || DEFAULT_REGION_CODE;

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

  const countryCode = region?.countries?.[0]?.iso_2?.toLowerCase() ?? "us";

  return (
    <>
      <Divider className="mb-2" />
      <Container>
        <div className="flex pt-8 pb-16 lg:pb-20">
          <SearchPageClient
            region={region!}
            countryCode={countryCode}
            filters={filters}
          />
        </div>
        <Subscription />
      </Container>
    </>
  );
}
