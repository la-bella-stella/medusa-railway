import { HttpTypes } from "@medusajs/types";
import { getPercentageDiff } from "./get-precentage-diff";
import { convertToLocale } from "./money";

export const getPricesForVariant = (variant: any, region?: HttpTypes.StoreRegion | null) => {
  if (!variant?.prices || !region) {
    return null;
  }

  const regionPrice = variant.prices.find(
    (price: any) => price.currency_code.toLowerCase() === region.currency_code.toLowerCase()
  );

  if (!regionPrice) {
    return null;
  }

  const calculatedAmount = regionPrice.amount / 100;
  const originalAmount = regionPrice.amount / 100;

  return {
    calculated_price_number: calculatedAmount,
    calculated_price: convertToLocale({
      amount: calculatedAmount,
      currency_code: region.currency_code,
    }),
    original_price_number: originalAmount,
    original_price: convertToLocale({
      amount: originalAmount,
      currency_code: region.currency_code,
    }),
    currency_code: region.currency_code,
    price_type: "default",
    percentage_diff: getPercentageDiff(originalAmount, calculatedAmount),
  };
};

export function getProductPrice({
  product,
  variantId,
  region,
}: {
  product: HttpTypes.StoreProduct;
  variantId?: string;
  region?: HttpTypes.StoreRegion | null;
}) {
  if (!product || !product.id) {
    throw new Error("No product provided");
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null;
    }

    const cheapestVariant: any = product.variants
      .filter((v: any) => v.prices && v.prices.length > 0)
      .sort((a: any, b: any) => {
        const aPrice = a.prices?.find(
          (p: any) => p.currency_code.toLowerCase() === region?.currency_code.toLowerCase()
        )?.amount || Infinity;
        const bPrice = b.prices?.find(
          (p: any) => p.currency_code.toLowerCase() === region?.currency_code.toLowerCase()
        )?.amount || Infinity;
        return aPrice - bPrice;
      })[0];

    if (!cheapestVariant) {
      return null;
    }

    return getPricesForVariant(cheapestVariant, region);
  };

  const variantPrice = () => {
    if (!product || !variantId) {
      return null;
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    );

    if (!variant) {
      return null;
    }

    return getPricesForVariant(variant, region);
  };

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  };
}