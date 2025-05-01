import { HttpTypes } from "@medusajs/types";
import ProductCard from "@modules/products/components/product-card";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { useRouter, useSearchParams } from "next/navigation";

const PRODUCT_LIMIT = 12;

export default function PaginatedProducts({
  sortBy,
  page,
  categoryId,
  countryCode,
  products,
  totalCount,
  region,
}: {
  sortBy?: SortOptions;
  page: number;
  categoryId?: string;
  countryCode: string;
  products: HttpTypes.StoreProduct[];
  totalCount: number;
  region: HttpTypes.StoreRegion | null;
}) {
  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (page + 1).toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  console.log("PaginatedProducts products:", products);

  return (
    <>
      <ul
        className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 w-full"
        data-testid="products-list"
      >
        {products.map((p) => {
          console.log("ProductCard product:", {
            id: p.id,
            title: p.title,
            handle: p.handle,
            thumbnail: p.thumbnail,
            variants: p.variants?.map((v) => ({
              id: v.id,
              prices: v.prices,
              inventory_quantity: v.inventory_quantity,
              metadata: v.metadata,
            })),
            metadata: p.metadata,
            tags: p.tags,
          });
          return (
            <li key={p.id} className="h-full">
              <ProductCard
                product={p}
                variant="gridSlim"
                region={region}
                className="h-full"
              />
            </li>
          );
        })}
      </ul>
      {totalPages > page && (
        <div className="pt-8 text-center xl:pt-14">
          <button
            data-variant="slim"
            className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none focus:bg-opacity-80 h-11 md:h-12 px-5 bg-heading text-white py-2 transform-none normal-case hover:text-white hover:bg-gray-600 hover:shadow-cart"
            onClick={handleLoadMore}
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}