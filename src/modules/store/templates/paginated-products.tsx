"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductHit = {
  id: string
  title: string
  handle: string
  thumbnail: string
  vendor: string
  price: string
  originalPrice?: string | null
  discountPercentage?: number | null
}

type PaginatedProductsProps = {
  hits: ProductHit[]
  sortBy?: string
  page: number
  countryCode: string
}

const PaginatedProducts = ({ hits }: PaginatedProductsProps) => {
  return (
    <>
      {hits.map((product) => (
        <LocalizedClientLink
          key={product.id}
          href={`/products/${product.handle}`}
          data-testid={`${product.handle}-link`}
          className="card--product block"
          title={product.title}
        >
          <div className="relative w-full aspect-[3/4] overflow-hidden">
            <img
              alt={product.title}
              src={product.thumbnail}
              className="object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105 absolute inset-0 w-full h-full"
            />
            {product.discountPercentage && (
              <span className="absolute top-3 start-3 bg-red-500 text-white text-[11px] px-2.5 py-1.5 rounded-md leading-tight font-semibold">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
          <div className="card__info-container">
            <div className="card__info-inner">
              <div className="card__vendor text-xs uppercase text-gray-500">
                {product.vendor}
              </div>
              <h3 className="card__title font-medium text-sm line-clamp-2">
                {product.title}
              </h3>
              <div className="inline-flex items-center gap-2">
                {product.originalPrice ? (
                  <>
                    <span className="text-base font-semibold text-red-500">${product.price}</span>
                    <del className="text-sm text-gray-400">${product.originalPrice}</del>
                  </>
                ) : (
                  <span className="text-base font-semibold">${product.price}</span>
                )}
              </div>
            </div>
          </div>
        </LocalizedClientLink>
      ))}
    </>
  )
}

export default PaginatedProducts
