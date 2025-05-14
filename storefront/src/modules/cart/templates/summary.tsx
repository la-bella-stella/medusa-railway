// @modules/cart/templates/summary.tsx
"use client";

import { Button } from "@medusajs/ui";
import CartTotals from "@modules/common/components/cart-totals";
import Divider from "@modules/common/components/divider";
import DiscountCode from "@modules/checkout/components/discount-code";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[];
  };
};

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address";
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery";
  } else {
    return "payment";
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart);

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-[2rem] leading-[2.75rem] font-heading">
        Summary
      </h2>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href="/checkout"
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink>
    </div>
  );
};

export default Summary;