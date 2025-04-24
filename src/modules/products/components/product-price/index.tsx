// src/modules/products/components/product-price.tsx
import { clx } from "@medusajs/ui";
import { getProductPrice } from "@lib/util/get-product-price";
import { HttpTypes } from "@medusajs/types";

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct;
  variant?: HttpTypes.StoreProductVariant;
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  });

  const selectedPrice = variant ? variantPrice : cheapestPrice;

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="flex items-center">
      <span
        className={clx(
          "text-base font-semibold md:text-xl lg:text-2xl",
          {
            "text-red-500": selectedPrice.price_type === "sale",
            "text-heading": selectedPrice.price_type !== "sale",
          }
        )}
        data-testid="product-price"
        data-value={selectedPrice.calculated_price_number}
      >
        {!variant && "From "} {selectedPrice.calculated_price}
      </span>
      {selectedPrice.price_type === "sale" && (
        <del
          className="font-segoe line-through text-gray-400 text-sm md:text-lg ltr:pl-2.5 rtl:pr-2.5"
          data-testid="original-product-price"
          data-value={selectedPrice.original_price_number}
        >
          {selectedPrice.original_price}
        </del>
      )}
    </div>
  );
}