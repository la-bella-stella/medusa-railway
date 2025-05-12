import { clx } from "@medusajs/ui";
import type {
  ProductPriceProps,
  VariantPrice,
  StoreVariantWithPrices,
  PriceEntry,
} from "types/global";
import { HttpTypes } from "@medusajs/types";

export default function ProductPrice({ product, variant, region }: ProductPriceProps) {
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(), // Normalize to uppercase
    }).format(amount);

  const getPriceData = (): VariantPrice | undefined => {
    let priceAmount: number | undefined;
    let currencyCode = (region?.currency_code ?? "USD").toUpperCase(); // Default to USD uppercase
    let msrp: number | undefined;
    let isSale = false;
    let discountPercentage: string | undefined;

    const findPrice = (prices: PriceEntry[], code: string) =>
      prices.find((price) => price.currency_code.toUpperCase() === code.toUpperCase());

    if (variant?.prices?.length) {
      let p = findPrice(variant.prices, currencyCode); // Try uppercase first
      if (!p) {
        p = findPrice(variant.prices, currencyCode.toLowerCase()); // Fallback to lowercase
      }
      if (!p) {
        return undefined;
      }
      priceAmount = p.amount;
      currencyCode = p.currency_code.toUpperCase();
      msrp =
        variant.metadata?.msrp && typeof variant.metadata.msrp === "number"
          ? variant.metadata.msrp
          : undefined;
    } else {
      const all = product.variants ?? [];
      const priced = all.filter(
        (v: HttpTypes.StoreProductVariant): v is StoreVariantWithPrices =>
          Array.isArray(v.prices) && v.prices.length > 0
      );
      if (!priced.length) {
        return undefined;
      }

      let cheapest: StoreVariantWithPrices | undefined;
      let lowestPrice = Number.MAX_SAFE_INTEGER;
      priced.forEach((v: StoreVariantWithPrices) => {
        let price = findPrice(v.prices, currencyCode); // Try uppercase first
        if (!price) {
          price = findPrice(v.prices, currencyCode.toLowerCase()); // Fallback to lowercase
        }
        if (price && price.amount < lowestPrice) {
          lowestPrice = price.amount;
          cheapest = v;
        }
      });

      if (!cheapest || !cheapest.prices) {
        return undefined;
      }

      let p = findPrice(cheapest.prices, currencyCode); // Try uppercase first
      if (!p) {
        p = findPrice(cheapest.prices, currencyCode.toLowerCase()); // Fallback to lowercase
      }
      if (!p) {
        return undefined;
      }

      priceAmount = p.amount;
      currencyCode = p.currency_code.toUpperCase();
      msrp =
        cheapest.metadata?.msrp && typeof cheapest.metadata.msrp === "number"
          ? cheapest.metadata.msrp
          : undefined;
    }

    if (priceAmount !== undefined && msrp !== undefined && priceAmount < msrp) {
      isSale = true;
      const pct = ((msrp - priceAmount) / msrp) * 100;
      discountPercentage = Math.round(pct).toString();
    } else if (
      priceAmount !== undefined &&
      product.tags?.some((t: HttpTypes.StoreProductTag) => t.value.includes("SALE"))
    ) {
      const saleTag = product.tags.find((t: HttpTypes.StoreProductTag) => t.value.match(/SALE(\d+)/));
      const m = saleTag?.value.match(/SALE(\d+)/);
      if (m) {
        isSale = true;
        discountPercentage = m[1];
        msrp = priceAmount / (1 - parseInt(m[1], 10) / 100);
      }
    }

    if (priceAmount === undefined) {
      return undefined;
    }

    return {
      calculated_price: formatPrice(priceAmount, currencyCode),
      original_price: msrp ? formatPrice(msrp, currencyCode) : "",
      price_type: isSale ? "sale" : "default",
      percentage_diff: discountPercentage ?? "",
      calculated_price_number: priceAmount,
      original_price_number: msrp ?? 0,
      currency_code: currencyCode,
    };
  };

  const data = getPriceData();
  if (!data) {
    return (
      <div className="text-gray-500 text-base font-semibold">
        Price unavailable
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className={clx(
          "text-base font-semibold md:text-xl lg:text-2xl",
          data.price_type === "sale" ? "text-red-500" : "text-gray-900"
        )}
        data-testid="product-price"
        data-value={data.calculated_price_number}
      >
        {data.calculated_price}
      </div>

      {data.price_type === "sale" && data.original_price && (
        <del
          className="font-segoe line-through text-gray-400 text-sm md:text-lg"
          data-testid="original-product-price"
          data-value={data.original_price_number}
        >
          {data.original_price}
        </del>
      )}
    </div>
  );
}