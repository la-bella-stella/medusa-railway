"use client";

import React from "react";
import { HttpTypes } from "@medusajs/types";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@modules/products/components/product-card";

const PRODUCT_LIMIT = 12;

export default function PaginatedProducts({
  sortBy,
  page: pageProp,
  categoryId,
  countryCode,
  products,
  totalCount,
  region,
}: {
  sortBy?: string;
  brand?: string;
  page: string | number;
  categoryId?: string;
  countryCode: string;
  products: HttpTypes.StoreProduct[];
  totalCount: number;
  region: HttpTypes.StoreRegion | null;
}) {
  const page = typeof pageProp === 'string' ? parseInt(pageProp, 10) || 1 : pageProp;
  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT);
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log("PaginatedProducts products:", products.map(p => ({
    id: p.id,
    title: p.title,
    brand: (p as any).brand,
  })));

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page + 1));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <ul
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-4
          gap-x-4
          gap-y-6
          w-full
        "
        data-testid="products-list"
      >
        {products.map((product) => (
          <li key={product.id} className="h-full">
            <ProductCard
              product={product}
              variant="gridSlim"
              region={region}
              className="h-full"
            />
          </li>
        ))}
      </ul>

      {totalPages > page && (
        <div className="pt-8 text-center">
          <button
            className="
              text-[13px] md:text-sm leading-4
              inline-flex items-center justify-center
              font-semibold font-body
              h-11 md:h-12 px-5 py-2
              bg-heading text-white
              rounded-md
              transition
              hover:bg-gray-600 hover:shadow-cart
            "
            onClick={handleLoadMore}
            data-variant="slim"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}