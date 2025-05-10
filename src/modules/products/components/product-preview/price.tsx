"use client";

import { Text, clx } from "@medusajs/ui";
import { VariantPrice } from "types/global";

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null;
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="text-sm text-gray-400 font-normal line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx(
          "text-base font-semibold",
          {
            "text-red-500": price.price_type === "sale",
            "text-gray-800": price.price_type !== "sale", // Updated to match legacy
          }
        )}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </>
  );
}