// src/app/(main)/store/page.tsx
import { Metadata } from "next";
import { cookies } from "next/headers";
import {
  SortOptions,
  sortOptions,          // your array of { value: SortOptions; label: string }
} from "@modules/store/components/refinement-list/sort-products";
import StoreTemplate from "@modules/store/templates";

const DEFAULT_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
};

interface StorePageProps {
  searchParams: {
    sortBy?: SortOptions;
    page?: string;
  };
}

export default async function StorePage({
  searchParams,
}: StorePageProps) {
  // 1) Await the dynamic proxy
  const { sortBy: rawSortBy, page: rawPage } = await searchParams;

  // 2) Validate & default sortBy
  //    If rawSortBy matches one of your option values, use it;
  //    otherwise fall back to the first sortOptions entry.
  const sortBy: SortOptions =
    sortOptions.find((o) => o.value === rawSortBy)?.value ??
    sortOptions[0].value;

  // 3) Default page to "1" if missing
  const page: string = rawPage ?? "1";

  // 4) Country code from cookie (or default)
  const cookieStore = await cookies();
  const countryCode =
    cookieStore.get("NEXT_LOCALE")?.value ?? DEFAULT_COUNTRY;

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
    />
  );
}
