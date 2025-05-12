import { Heading } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  // Log cart to debug
  console.log("CheckoutSummary cart:", cart)

  // Fallback cart
  const fallbackCart: HttpTypes.StoreCart = cart || {
    id: "",
    items: [],
    subtotal: 0,
    total: 0,
    currency_code: "USD",
    promotions: [],
    region: undefined,
    payment_collection: undefined,
    shipping_address: undefined,
    billing_address: undefined,
    email: "",
    shipping_methods: [],
    original_item_total: 0,
    original_item_subtotal: 0,
    original_item_tax_total: 0,
    item_total: 0,
    item_subtotal: 0,
    item_tax_total: 0,
    shipping_total: 0,
    shipping_subtotal: 0,
    shipping_tax_total: 0,
    original_total: 0,
    original_subtotal: 0,
    original_tax_total: 0,
    original_shipping_total: 0,
    original_shipping_subtotal: 0,
    original_shipping_tax_total: 0,
    discount_total: 0,
    discount_tax_total: 0,
    tax_total: 0,
    gift_card_total: 0,
    gift_card_tax_total: 0,
    created_at: undefined,
    updated_at: undefined,
    metadata: undefined,
  }

  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full bg-white flex flex-col">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline"
        >
          In your Cart
        </Heading>
        <Divider className="my-6" />
        <CartTotals totals={fallbackCart} />
        <ItemsPreviewTemplate cart={fallbackCart} />
        <div className="my-6">
          <DiscountCode cart={fallbackCart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary