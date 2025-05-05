import { Heading, Text } from "@medusajs/ui"
import FiltersSidebar from "@modules/search/components/filter-sidebar"
import MobileFilterToggle from "@modules/search/components/mobile-filter-toggle"
import LoadMoreButton from "@modules/search/components/load-more-button"
import SortDropdown from "@modules/search/components/sort-dropdown"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
}

const SearchResultsTemplate = ({
  query,
  ids,
  sortBy,
  page,
  countryCode,
}: SearchResultsTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1

  return (
    <div className="content-container">
      <div className="flex pt-8 pb-16 lg:pb-20">
        {/* Filters Sidebar */}
        <FiltersSidebar sortBy={sortBy} search={true} />
        {/* Main Content */}
        <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
          <div className="flex justify-between items-center mb-7">
            <h1 className="text-2xl font-bold text-heading hidden lg:inline-flex pb-1">
              Search Result
            </h1>
            <MobileFilterToggle sortBy={sortBy} search={true} />
            <div className="flex items-center justify-end">
              <div className="flex-shrink-0 text-body text-xs md:text-sm leading-4 ltr:pr-4 rtl:pl-4 ltr:md:mr-6 rtl:md:ml-6 ltr:pl-2 rtl:pr-2 hidden lg:block">
                {ids.length} items
              </div>
              <div className="relative ltr:ml-2 rtl:mr-2 ltr:lg:ml-0 rtl:lg:mr-0 z-10 min-w-[180px]">
                <SortDropdown query={query} sortBy={sortBy} page={pageNumber} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
            {ids.length > 0 ? (
              <PaginatedProducts
                productsIds={ids}
                sortBy={sortBy}
                page={pageNumber}
                countryCode={countryCode}
              />
            ) : (
              <Text className="col-span-full text-center text-body">No results.</Text>
            )}
          </div>
          <div className="pt-8 text-center xl:pt-14">
            <LoadMoreButton query={query} page={pageNumber} />
          </div>
        </div>
      </div>
      {/* Newsletter Section */}
      <div className="px-5 sm:px-8 md:px-16 2xl:px-24 flex flex-col justify-center xl:justify-between items-center rounded-lg bg-grey-10 py-10 md:py-14 lg:py-16 xl:flex-row">
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
                className="py-2 md:px-5 w-full appearance-none border text-input text-xs md:text-[13px] lg:text-sm font-body rounded-md placeholder-body min-h-12 transition duration-200 ease-in-out border-grey-20 focus:outline-none focus:border-heading h-12 lg:h-14 text-center ltr:sm:text-left rtl:sm:text-right bg-white"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <button
              data-variant="flat"
              className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md focus:outline-none bg-heading text-white px-5 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-grey-60 hover:shadow-cart mt-3 sm:mt-0 w-full sm:w-auto ltr:sm:ml-2 rtl:sm:mr-2 normal-case"
              type="submit"
            >
              <span className="lg:py-0.5">Subscribe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SearchResultsTemplate