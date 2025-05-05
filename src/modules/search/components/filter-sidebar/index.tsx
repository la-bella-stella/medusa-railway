import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ClearAllButton from "../clear-all-button"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type FiltersSidebarProps = {
  sortBy?: SortOptions
  search?: boolean
}

const FiltersSidebar = ({ sortBy = "created_at", search }: FiltersSidebarProps) => {
  return (
    <div className="flex-shrink-0 hidden lg:block w-96 ltr:pr-24 rtl:pl-24">
      <div className="sticky top-0">
        <div className="pb-7">
          {/* Breadcrumb */}
          <div className="flex items-center breadcrumb">
            <ol className="flex items-center w-full overflow-hidden">
              <li className="text-sm text-body px-2.5 transition duration-200 ease-in ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:last:pl-0 hover:text-heading">
                <LocalizedClientLink href="/">Home</LocalizedClientLink>
              </li>
              <li className="text-base text-body mt-0.5">/</li>
              <li className="text-sm text-body px-2.5 transition duration-200 ease-in ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:last:pl-0 hover:text-heading">
                <LocalizedClientLink href="/search" className="capitalize font-semibold text-heading">
                  Search
                </LocalizedClientLink>
              </li>
            </ol>
          </div>
        </div>
        <div className="pt-1">
          {/* Filters Section */}
          <div className="block border-b border-grey-20 pb-7 mb-7">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-semibold text-heading text-xl md:text-2xl">Filters</h2>
              <ClearAllButton />
            </div>
            {/* Example filter tag */}
            <div className="flex flex-wrap -m-1.5 pt-2">
              <div className="group flex flex-shrink-0 m-1.5 items-center border border-grey-20 bg-grey-5 rounded-lg text-xs px-3.5 py-2.5 capitalize text-heading cursor-pointer transition duration-200 ease-in-out hover:border-heading">
                Burberry
                <svg
                  className="text-sm text-body ltr:ml-2 rtl:mr-2 ltr:-mr-0.5 rtl:-ml-0.5 mt-0.5 transition duration-200 ease-in-out group-hover:text-heading"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
                </svg>
              </div>
            </div>
          </div>
          {/* Filter Categories */}
          {["Category", "Brands", "Price", "Colors", "Size", "Gender", "Season"].map((filter) => (
            <div key={filter} className="block border-b border-grey-20 pb-7 mb-7">
              <div className="flex items-center justify-between cursor-pointer mb-3">
                <h3 className="text-heading text-sm md:text-base font-semibold">{filter}</h3>
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={
                    filter === "Category"
                      ? "M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"
                      : "M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"
                  }></path>
                </svg>
              </div>
              {filter === "Category" ? (
                <div className="overflow-hidden" style={{ height: "auto", opacity: 1 }}>
                  <div className="mt-2 flex flex-col space-y-4 max-h-60 overflow-y-auto pr-1">
                    {["MEN", "Men's '25 Collection", "General 4", "SALE COLLECTION", "New Markdowns"].map((category) => (
                      <label key={category} className="group flex items-center text-heading text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox w-5 h-5 border border-grey-20 rounded cursor-pointer transition duration-500 ease-in-out focus:ring-offset-0 text-heading hover:border-heading focus:outline-none focus:ring-0 focus-visible:outline-none checked:bg-heading"
                          name={category.toLowerCase().replace(/\s+/g, "-")}
                          value={category.toLowerCase().replace(/\s+/g, "-")}
                        />
                        <span className="ltr:ml-4 rtl:mr-4 -mt-0.5">{category}</span>
                      </label>
                    ))}
                    <div className="pt-2">
                      <button
                        data-variant="custom"
                        className="md:text-sm inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-sm text-heading w-full"
                      >
                        Load More
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FiltersSidebar