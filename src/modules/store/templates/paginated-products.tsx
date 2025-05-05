type PaginatedProductsProps = {
  productsIds: string[]
  sortBy?: string
  page: number
  countryCode: string
}

const PaginatedProducts = ({ productsIds, sortBy, page, countryCode }: PaginatedProductsProps) => {
  // Mock data with discounts (replace with actual fetch)
  const products = productsIds.map((id, index) => ({
    id,
    title: `Product ${id}`,
    thumbnail: "https://via.placeholder.com/300",
    vendor: "BURBERRY",
    price: (Math.random() * 1000 + 400).toFixed(2),
    originalPrice: index % 3 === 0 ? (Math.random() * 1000 + 500).toFixed(2) : null, // Mock discount for every third product
    discountPercentage: index % 3 === 0 ? Math.floor(Math.random() * 30 + 1) : null, // Mock discount percentage
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
              className="object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
              src={product.thumbnail}
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