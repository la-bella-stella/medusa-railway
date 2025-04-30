import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryByHandle, listCategories } from "@lib/data/categories";
import { listRegions } from "@lib/data/regions";
import CategoryTemplate from "@modules/categories/templates";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

// Define props type for the page
type Props = {
  params: Promise<{ category: string[] }>;
  searchParams: Promise<{
    sortBy?: SortOptions;
    page?: string;
  }>;
};

// Generate static paths for top-level categories
export async function generateStaticParams() {
  const productCategories = await listCategories();

  if (!productCategories) {
    return [];
  }

  const categoryHandles: string[] = productCategories.map(
    (category: { handle: string }) => category.handle
  );

  return categoryHandles.map((handle) => ({
    category: [handle],
  }));
}

// Generate metadata for SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  try {
    const productCategory = await getCategoryByHandle(params.category);

    const title = `${productCategory.name} | Medusa Store`;
    const description = productCategory.description ?? `${title} category.`;

    return {
      title,
      description,
      alternates: {
        canonical: `collections/${params.category.join("/")}`,
      },
    };
  } catch (error) {
    notFound();
  }
}

// Render the category page
export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sortBy, page } = searchParams;

  const productCategory = await getCategoryByHandle(params.category);

  if (!productCategory) {
    notFound();
  }

  // Derive default countryCode from regions
  const regions = await listRegions();
  const countryCode = regions?.[0]?.countries?.[0]?.iso_2 || "us";

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
    />
  );
}