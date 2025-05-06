"use client"

type ProductHit = {
  id: string
  title: string
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
  // TODO: Replace with actual data fetching logic
  const products = hits.map((hit, index) => ({
    ...hit,
    thumbnail: hit.thumbnail,
    vendor: hit.vendor,
    price: hit.price || (Math.random() * 1000 + 400).toFixed(2),
    originalPrice:
      hit.originalPrice ?? (index % 3 === 0 ? (Math.random() * 1000 + 500).toFixed(2) : null),
    discountPercentage:
      hit.discountPercentage ?? (index % 3 === 0 ? Math.floor(Math.random() * 30 + 1) : null),
  }))

  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="card--product"
          role="button"
          title={product.title}
        >
          <div className="relative w-full aspect-[3/4] overflow-hidden">
            <img
              alt={product.title}
              src={product.thumbnail}
              className="object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
              style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
            />
            {product.discountPercentage && (
              <span className="absolute top-3 start-3 bg-red-500 text-white text-[11px] px-2.5 py-1.5 rounded-md leading-tight font-semibold">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
          <div className="card__info-container">
            <div className="card__info-inner">
              <div className="card__vendor">{product.vendor}</div>
              <h3 className="card__title">{product.title}</h3>
              <div className="inline-flex">
                {product.originalPrice ? (
                  <>
                    <span className="text-sm font-bold text-heading uppercase">From</span>
                    <span className="text-base font-semibold text-red-500 ml-2">${product.price}</span>
                    <del className="text-sm text-grey-40 font-normal ml-2">${product.originalPrice}</del>
                  </>
                ) : (
                  <span data-testid="product-price">${product.price}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default PaginatedProducts
