// src/app/(main)/layout.tsx
import { Metadata } from "next";
import { retrieveCart, listCartOptions } from "@lib/data/cart";
import { retrieveCustomer } from "@lib/data/customer";
import { getBaseURL } from "@lib/util/env";
import { StoreCartShippingOption } from "@medusajs/types";
import Nav from "@modules/layout/templates/nav";
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner";
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge";
import Footer from "@modules/layout/templates/footer";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await retrieveCustomer();
  const cart = await retrieveCart();

  let shippingOptions: StoreCartShippingOption[] = [];

  if (cart) {
    // listCartOptions now returns StoreCartShippingOption[] | null
    shippingOptions = (await listCartOptions()) || [];
  }

  return (
    <>
      <Nav />

      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}

      {children}

      <Footer />
    </>
  );
}
