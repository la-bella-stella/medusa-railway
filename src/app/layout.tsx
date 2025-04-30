// src/app/layout.tsx
import { getBaseURL } from "@lib/util/env";
import { Metadata } from "next";
import "styles/globals.css";
import Nav from "@modules/layout/templates/nav";
import Footer from "@modules/layout/templates/footer";
import { Suspense } from "react";
import { retrieveCart, listCartOptions, getCartId } from "@lib/data/cart";
import { retrieveCustomer } from "@lib/data/customer";
import { StoreCartShippingOption } from "@medusajs/types";
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner";
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge";
import ClientWrapper from "./ClientWrapper";
import NextUIProviderWrapper from "./NextUIProviderWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
};

async function RootLayout({ children }: { children: React.ReactNode }) {
  let customer = null;
  let cart = null;
  let shippingOptions: StoreCartShippingOption[] = [];

  // load customer
  try {
    customer = await retrieveCustomer();
    console.log("RootLayout: retrieveCustomer result:", {
      customerId: customer?.id,
      email: customer?.email,
    });
  } catch (e: unknown) {
    console.error("RootLayout: retrieveCustomer failed:", {
      message: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    });
  }

  // load cart & shipping options
  try {
    const cartIdAttempted = await getCartId();
    cart = await retrieveCart();
    console.log("RootLayout: retrieveCart result:", {
      cartId: cart?.id,
      regionId: cart?.region_id,
      currencyCode: cart?.currency_code,
      items: cart?.items?.map((item) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
      })),
      shippingAddress: cart?.shipping_address,
    });

    // ← only fetch shipping options once the cart has a shipping_address
    if (cart && cart.shipping_address) {
      shippingOptions = await listCartOptions();
    }
  } catch (e: unknown) {
    console.error("RootLayout: retrieveCart failed:", {
      message: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
      cartIdAttempted: await getCartId(),
    });
    cart = null;
  }

  return (
    <html lang="en" data-mode="light">
      <body>
        <NextUIProviderWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientWrapper cart={cart}>
              <div className="fixed inset-x-0 top-0 z-50">
                <Nav />
              </div>
              <div className="pt-16">
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
              </div>
              <main className="relative pt-16">{children}</main>
              <Footer />
            </ClientWrapper>
          </Suspense>
        </NextUIProviderWrapper>
      </body>
    </html>
  );
}

export default RootLayout;
