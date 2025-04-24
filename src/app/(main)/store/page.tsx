// src/app/(main)/store/page.tsx
import { Metadata } from "next";
import { cookies } from "next/headers";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import StoreTemplate from "@modules/store/templates";

const DEFAULT_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "us";

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
  // 1) Await the dynamic proxy before destructuring
  const { sortBy, page: rawPage } = await searchParams;

  // 2) Default page to "1" when missing
  const page: string = rawPage ?? "1";

  // 3) Await cookies() so .get() is available
  const cookieStore = await cookies();
  const countryCode =
    cookieStore.get("NEXT_LOCALE")?.value ?? DEFAULT_COUNTRY;

  // 4) Render your store template, passing sortBy along (or undefined)
  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
    />
  );
}
