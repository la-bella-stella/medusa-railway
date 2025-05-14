// @modules/checkout/templates/checkout-form.tsx
import { listCartShippingMethods } from "@lib/data/fulfillment";
import { listCartPaymentMethods } from "@lib/data/payment";
import { HttpTypes } from "@medusajs/types";
import Addresses from "@modules/checkout/components/addresses";
import Payment from "@modules/checkout/components/payment";
import Review from "@modules/checkout/components/review";
import Shipping from "@modules/checkout/components/shipping";

export default async function CheckoutForm({
  cart,
  customer,
  step, // Add step prop
}: {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
  step: string;
}) {
  // Log cart to debug
  console.log("CheckoutForm cart:", cart);

  // Fallback cart, aligned with HttpTypes.StoreCart
  const fallbackCart: HttpTypes.StoreCart = cart || {
    id: "",
    region: undefined,
    currency_code: "USD",
    shipping_address: undefined,
    billing_address: undefined,
    email: "",
    shipping_methods: [],
    payment_collection: undefined,
    items: [],
    promotions: [],
    total: 0,
    subtotal: 0,
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
  };

  // Fetch shipping and payment methods with fallbacks
  const shippingMethods = fallbackCart.id
    ? await listCartShippingMethods(fallbackCart.id).catch((err) => {
        console.error("Error fetching shipping methods:", err);
        return [];
      })
    : [];
  const paymentMethods = await listCartPaymentMethods().catch((err) => {
    console.error("Error fetching payment methods:", err);
    return [];
  });

  // Log fetched data
  console.log("Shipping Methods:", shippingMethods);
  console.log("Payment Methods:", paymentMethods);

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={fallbackCart} customer={customer} step={step} />
      <Shipping
        cart={fallbackCart}
        availableShippingMethods={shippingMethods || []}
      />
      <Payment
        cart={fallbackCart}
        availablePaymentMethods={paymentMethods || []}
      />
      <Review cart={fallbackCart} />
    </div>
  );
}