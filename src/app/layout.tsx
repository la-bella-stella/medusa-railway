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
  let customer = null;
  let cart = null;
  let shippingOptions: StoreCartShippingOption[] = [];

  try {
    customer = await retrieveCustomer();
    console.log("RootLayout: retrieveCustomer result:", {
      customerId: customer?.id,
      email: customer?.email,
    });
  } catch (e) {
    console.error("RootLayout: retrieveCustomer failed:", e);
  }

  try {
    cart = await retrieveCart();
    console.log("RootLayout: retrieveCart result:", {
      cartId: cart?.id,
      regionId: cart?.region_id,
      currencyCode: cart?.currency_code,
      items: cart?.items?.map((item) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
      })),
    });
    if (cart) {
      shippingOptions = (await listCartOptions()) || [];
    }
  } catch (e) {
    console.error("RootLayout: retrieveCart failed:", e);
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