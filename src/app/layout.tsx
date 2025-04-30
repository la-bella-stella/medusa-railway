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

/**
 * RootLayout component optimized for server-side rendering.
 * Fetches customer and cart data in parallel and uses granular Suspense boundaries
 * to minimize loading states.
 */
async function RootLayout({ children }: { children: React.ReactNode }) {
  let customer = null;
  let cart = null;
  let shippingOptions: StoreCartShippingOption[] = [];

  try {
    // Fetch customer and cart data in parallel for faster loading
    const [customerData, cartData] = await Promise.all([
      retrieveCustomer().catch(() => null), // Graceful error handling
      retrieveCart().catch(() => null),
    ]);
    customer = customerData;
    cart = cartData;

    // Log fetched data for debugging (optional)
    console.log("RootLayout: retrieveCustomer result:", {
      customerId: customer?.id,
      email: customer?.email,
    });
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

    // Conditionally fetch shipping options if cart has a shipping address
    if (cart && cart.shipping_address) {
      shippingOptions = await listCartOptions();
    }
  } catch (e: unknown) {
    // Log errors without crashing the app
    console.error("RootLayout: data fetching failed:", {
      message: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    });
  }

  return (
    <html lang="en" data-mode="light">
      <body>
        <NextUIProviderWrapper>
          <ClientWrapper cart={cart}>
            {/* Fixed navigation bar */}
            <div className="fixed inset-x-0 top-0 z-50">
              <Nav />
            </div>

            {/* Content with padding to avoid overlap with fixed nav */}
            <div className="pt-16">
              {/* Granular Suspense for CartMismatchBanner */}
              {customer && cart && (
                <Suspense fallback={<div>Loading banner...</div>}>
                  <CartMismatchBanner customer={customer} cart={cart} />
                </Suspense>
              )}

              {/* Granular Suspense for FreeShippingPriceNudge */}
              {cart && (
                <Suspense fallback={<div>Loading price nudge...</div>}>
                  <FreeShippingPriceNudge
                    variant="popup"
                    cart={cart}
                    shippingOptions={shippingOptions}
                  />
                </Suspense>
              )}
            </div>

            {/* Main content */}
            <main className="relative pt-16">{children}</main>

            {/* Footer */}
            <Footer />
          </ClientWrapper>
        </NextUIProviderWrapper>
      </body>
    </html>
  );
}

export default RootLayout;