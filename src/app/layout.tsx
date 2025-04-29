import { getBaseURL } from "@lib/util/env";
import { Metadata } from "next";
import "styles/globals.css";
import Nav from "@modules/layout/templates/nav";
import Footer from "@modules/layout/templates/footer";
import { Suspense } from "react";
import { retrieveCart, listCartOptions } from "@lib/data/cart";
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
  const customer = await retrieveCustomer();
  const cart = await retrieveCart();

  let shippingOptions: StoreCartShippingOption[] = [];
  if (cart) {
    shippingOptions = (await listCartOptions()) || [];
  }

  return (
    <html lang="en" data-mode="light">
      <body>
        <NextUIProviderWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientWrapper>
              {/* Nav is now fixed at the top */}
              <div className="fixed inset-x-0 top-0 z-50">
                <Nav />
              </div>

              {/* Banners sit below the fixed Nav */}
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

              {/* Main content pushed down by 4rem (h-16) to clear the Nav */}
              <main className="relative pt-16">
                {children}
              </main>

              <Footer />
            </ClientWrapper>
          </Suspense>
        </NextUIProviderWrapper>
      </body>
    </html>
  );
}

export default RootLayout;
