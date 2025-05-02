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
import { HttpTypes } from "@medusajs/types";
import { Filters } from "types/global";
import { useUI } from "@lib/context/ui-context";

export default function CollectionTemplate({
  collection,
  sortBy,
  page,
  countryCode,
  filterData = { tags: [], categories: [], collections: [], brands: [], colors: [] },
  products,
  region,
  totalCount = 0,
  filters = {
    category: [],
    brand: [],
    collection: [],
    grouped_color: [],
    gender: [],
    season: [],
    price: [],
    tags: [],
  },
  onFilterChange = () => {},
}: {
  collection: HttpTypes.StoreCollection;
  sortBy?: SortOptions;
  page?: string;
  countryCode: string;
  filterData?: {
    tags: any[];
    categories: HttpTypes.StoreProductCategory[];
    collections: HttpTypes.StoreCollection[];
    brands: any[];
    colors: any[];
  };
  products: HttpTypes.StoreProduct[];
  region: HttpTypes.StoreRegion | null;
  totalCount?: number;
  filters?: Filters;
  onFilterChange?: (next: Filters) => void;
}) {
  const pageNumber = page ? parseInt(page) : 1;
  const sort = sortBy || "created_at";
  const { openSidebar } = useUI();

  if (!collection || !countryCode) notFound();

  return (
    <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
      <div className="flex pt-8 pb-16 lg:pb-20" data-testid="collection-container">
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
                    <LocalizedClientLink href={`/brands/${collection.handle}`}>
                      {collection.title}
                    </LocalizedClientLink>
                  </li>
                </ol>
              </div>
            </div>
            <div className="pt-1">
              <div className="block border-b border-gray-300 pb-7 mb-7">
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="font-semibold text-heading text-xl md:text-2xl">Filters</h2>
                </div>
                <div className="flex flex-wrap -m-1.5 pt-2">
                  <StoreFilters filters={filters} onChange={onFilterChange} filterData={filterData} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
          <div className="flex justify-between items-center mb-7">
            <h1 className="text-2xl font-bold text-heading hidden lg:inline-flex pb-1">{collection.title}</h1>
            <button
              className="lg:hidden text-heading text-sm px-4 py-2 font-semibold border border-gray-300 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-gray-200"
              onClick={() => openSidebar({ view: "DISPLAY_FILTER", data: { searchResultCount: totalCount } })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18px"
                height="14px"
                viewBox="0 0 18 14"
              >
                <g id="Group_36196" data-name="Group 36196" transform="translate(-925 -1122.489)">
                  <path
                    id="Path_22590"
                    data-name="Path 22590"
                    d="M942.581,1295.564H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1295.564,942.581,1295.564Z"
                    transform="translate(0 -169.575)"
                    fill="currentColor"
                  />
                  <path
                    id="Path_22591"
                    data-name="Path 22591"
                    d="M942.581,1951.5H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1951.5,942.581,1951.5Z"
                    transform="translate(0 -816.512)"
                    fill="currentColor"
                  />
                  <path
                    id="Path_22593"
                    data-name="Path 22593"
                    d="M1163.713,1122.489a2.5,2.5,0,1,0,1.768.732A2.483,2.483,0,0,0,1163.713,1122.489Z"
                    transform="translate(-233.213)"
                    fill="currentColor"
                  />
                  <path
                    id="Path_22594"
                    data-name="Path 22594"
                    d="M2344.886,1779.157a2.5,2.5,0,1,0,.731,1.768A2.488,2.488,0,0,0,2344.886,1779.157Z"
                    transform="translate(-1405.617 -646.936)"
                    fill="currentColor"
                  />
                </g>
              </svg>
              <span className="ltr:pl-2.5 rtl:pr-2.5">Filters</span>
            </button>
            <div className="flex items-center justify-end">
              <div className="flex-shrink-0 text-body text-xs md:text-sm leading-4 ltr:pr-4 rtl:pl-4 ltr:md:mr-6 rtl:md:ml-6 ltr:pl-2 rtl:pr-2 hidden lg:block">
                {totalCount} items
              </div>
              <div className="relative ltr:ml-2 rtl:mr-2 ltr:lg:ml-0 rtl:lg:mr-0 z-10 min-w-[180px]">
                <RefinementList
                  sortBy={sort}
                  data-testid="sort-by-container"
                />
              </div>
            </div>
          </div>
          <Suspense
            fallback={<SkeletonProductGrid numberOfProducts={products.length || 12} />}
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id} // Temporarily use categoryId; update to collectionId if PaginatedProducts is modified
              countryCode={countryCode}
              products={products}
              totalCount={totalCount}
              region={region}
            />
          </Suspense>
        </div>
      </div>
      <div className="px-5 sm:px-8 md:px-16 2xl:px-24 flex flex-col justify-center xl:justify-between items-center rounded-lg bg-gray-200 py-10 md:py-14 lg:py-16 xl:flex-row">
        <div className="-mt-1.5 lg:-mt-2 xl:-mt-0.5 text-center ltr:xl:text-left rtl:xl:text-right mb-7 md:mb-8 lg:mb-9 xl:mb-0">
          <h3 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl xl:leading-10 font-bold mb-2 md:mb-2.5 lg:mb-3 xl:mb-3.5">
            Get Expert Tips In Your Inbox
          </h3>
          <p className="text-body text-xs md:text-sm leading-6 md:leading-7">
            Subscribe to our newsletter and stay updated.
          </p>
        </div>
        <form className="flex-shrink-0 w-full sm:w-96 md:w-[545px] z-10 relative">
          <div className="flex flex-col sm:flex-row items-start justify-end">
            <div className="w-full">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Write your email here"
                className="py-2 md:px-5 w-full appearance-none border text-input text-xs md:text-[13px] lg:text-sm font-body rounded-md placeholder-body min-h-12 transition duration-200 ease-in-out border-gray-300 focus:outline-none focus:border-heading md:h-12 px-4 lg:px-7 h-12 lg:h-14 text-center ltr:sm:text-left rtl:sm:text-right bg-white"
                autoComplete="off"
                spellCheck="false"
                aria-invalid="false"
              />
            </div>
            <button
              data-variant="flat"
              className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none focus:bg-opacity-80 bg-heading text-white px-5 md:px-6 lg:px-8 py-4 md:py修为-3.5 lg:py-4 hover:text-white hover:bg-gray-600 hover:shadow-cart mt-3 sm:mt-0 w-full sm:w-auto ltr:sm:ml-2 rtl:sm:mr-2 md:h-full flex-shrink-0"
            >
              <span className="lg:py-0.5">Subscribe</span>
            </button>
          </div>
        </form>
      </div>
      <FilterSidebar filters={filters} onChange={onFilterChange} />
    </div>
  );
}