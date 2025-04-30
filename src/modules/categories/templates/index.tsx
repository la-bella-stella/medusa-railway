import { notFound } from "next/navigation";
import { Suspense } from "react";

import InteractiveLink from "@modules/common/components/interactive-link";
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid";
import StoreFilters from "@modules/store/components/store-filters";
import RefinementList from "@modules/store/components/refinement-list";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import PaginatedProducts from "@modules/store/templates/paginated-products";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import FilterSidebar from "@modules/store/components/filter-sidebar";
import MobileFilterButton from "@modules/store/components/mobile-filter-button";
import { HttpTypes } from "@medusajs/types";
import { Filters } from "types/global";

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory;
  sortBy?: SortOptions;
  page?: string;
  countryCode: string;
}) {
  const pageNumber = page ? parseInt(page) : 1;
  const sort = sortBy || "created_at";

  if (!category || !countryCode) notFound();

  const parents = [] as HttpTypes.StoreProductCategory[];

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category);
      getParents(category.parent_category);
    }
  };

  getParents(category);

  // Placeholder filters (update with actual filter logic if needed)
  const filters: Filters = {
    category: [],
    brand: [],
    collection: [],
    grouped_color: [],
    gender: [],
    season: [],
    price: [],
  };

  return (
    <>
      <FilterSidebar filters={filters} />
      <div className="flex pt-8 pb-16 lg:pb-20" data-testid="category-container">
        <div className="flex-shrink-0 hidden ltr:pr-24 rtl:mr-24 lg:block w-96">
          <div style={{ position: "relative", top: "0px" }}>
            <div className="pb-7">
              <div className="flex items-center chawkbazarBreadcrumb">
                <ol className="flex items-center w-full overflow-hidden">
                  <li className="text-sm text-body px-2.5 transition duration-200 ease-in ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:last:pl-0 hover:text-heading">
                    <LocalizedClientLink href="/">Home</LocalizedClientLink>
                  </li>
                  <li className="text-base text-body mt-0.5">/</li>
                  <li className="text-sm text-body px-2.5 transition duration-200 ease-in ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:last:pl-0 hover:text-heading">
                    <LocalizedClientLink href={`/collections/${category.handle}`}>
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                </ol>
              </div>
            </div>
            <div className="pt-1">
              <div className="block border-b border-gray-300 pb-7 mb-7">
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="font-semibold text-heading text-xl md:text-2xl">
                    Filters
                  </h2>
                </div>
                <StoreFilters filters={filters} />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
          <div className="flex justify-between items-center mb-7">
            <h1 className="text-2xl font-bold text-heading hidden lg:inline-flex pb-1">
              {category.name}
            </h1>
            <MobileFilterButton itemCount={category.products?.length || 0} />
            <div className="flex items-center justify-end">
              <div className="flex-shrink-0 text-body text-xs md:text-sm leading-4 ltr:pr-4 rtl:pl-4 ltr:md:mr-6 rtl:md:ml-6 ltr:pl-2 rtl:pr-2 hidden lg:block">
                {category.products?.length || 0} items
              </div>
              <div className="relative ltr:ml-2 rtl:mr-2 ltr:lg:ml-0 rtl:lg:mr-0 z-10 min-w-[180px]">
                <RefinementList
                  sortBy={sort}
                  data-testid="sort-by-container"
                />
              </div>
            </div>
          </div>
          {category.description && (
            <div className="mb-8 text-base-regular">
              <p>{category.description}</p>
            </div>
          )}
          {category.category_children && (
            <div className="mb-8 text-base-large">
              <ul className="grid grid-cols-1 gap-2">
                {category.category_children?.map((c) => (
                  <li key={c.id}>
                    <InteractiveLink href={`/collections/${c.handle}`}>
                      {c.name}
                    </InteractiveLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
            />
          </Suspense>
          <div className="pt-8 text-center xl:pt-14">
            <button
              data-variant="slim"
              className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none focus:bg-opacity-80 h-11 md:h-12 px-5 bg-heading text-white py-2 transform-none normal-case hover:text-white hover:bg-gray-600 hover:shadow-cart"
            >
              Load More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}