// storefront/src/app/(checkout)/checkout/page.tsx
import { retrieveCart } from "@lib/data/cart";
import { retrieveCustomer } from "@lib/data/customer";
import PaymentWrapper from "@modules/checkout/components/payment-wrapper";
import CheckoutForm from "@modules/checkout/templates/checkout-form";
import CheckoutSummary from "@modules/checkout/templates/checkout-summary";
import { HttpTypes } from "@medusajs/types";
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function Checkout() {
  // Read cartId and step from custom headers set by middleware
  const headersInstance = await headers();
  const cartId = headersInstance.get("x-checkout-cart-id");
  const step = headersInstance.get("x-checkout-step") || "address";

  if (!cartId) {
    redirect("/cart");
  }

  const cart: HttpTypes.StoreCart | null = await retrieveCart(cartId);

  if (!cart) {
    redirect("/cart");
  }

  const customer: HttpTypes.StoreCustomer | null = await retrieveCustomer();

  console.log("Checkout cart:", cart);
  console.log("Checkout customer:", customer);

  const fallbackCart: HttpTypes.StoreCart = {
    ...cart,
    region: cart.region || undefined,
    currency_code: cart.currency_code || "USD",
    payment_collection: cart.payment_collection || undefined,
    items: cart.items || [],
    shipping_address: cart.shipping_address || undefined,
    billing_address: cart.billing_address || undefined,
    email: cart.email || "",
    shipping_methods: cart.shipping_methods || [],
    promotions: cart.promotions || [],
    total: cart.total || 0,
    subtotal: cart.subtotal || 0,
    original_item_total: cart.original_item_total || 0,
    original_item_subtotal: cart.original_item_subtotal || 0,
    original_item_tax_total: cart.original_item_tax_total || 0,
    item_total: cart.item_total || 0,
    item_subtotal: cart.item_subtotal || 0,
    item_tax_total: cart.item_tax_total || 0,
    shipping_total: cart.shipping_total || 0,
    shipping_subtotal: cart.shipping_subtotal || 0,
    shipping_tax_total: cart.shipping_tax_total || 0,
    original_total: cart.original_total || 0,
    original_subtotal: cart.original_subtotal || 0,
    original_tax_total: cart.original_tax_total || 0,
    original_shipping_total: cart.original_shipping_total || 0,
    original_shipping_subtotal: cart.original_shipping_subtotal || 0,
    original_shipping_tax_total: cart.original_shipping_tax_total || 0,
    discount_total: cart.discount_total || 0,
    discount_tax_total: cart.discount_tax_total || 0,
    tax_total: cart.tax_total || 0,
    gift_card_total: cart.gift_card_total || 0,
    gift_card_tax_total: cart.gift_card_tax_total || 0,
    created_at: cart.created_at || undefined,
    updated_at: cart.updated_at || undefined,
    metadata: cart.metadata || undefined,
  };

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={fallbackCart}>
        <CheckoutForm cart={fallbackCart} customer={customer} step={step} />
      </PaymentWrapper>
      <CheckoutSummary cart={fallbackCart} />
    </div>
  );
}