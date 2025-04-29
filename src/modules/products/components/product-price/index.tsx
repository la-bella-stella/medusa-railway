import { clx } from "@medusajs/ui";
import type {
  ProductPriceProps,
  VariantPrice,
  StoreVariantWithPrices,
  PriceEntry,
} from "../../../../types/global";

export default function ProductPrice({ product, variant, region }: ProductPriceProps) {
  // Debug: Log product, variant, and region data
  console.log("ProductPrice Debug:", {
    productId: product.id,
    variant: variant,
    productVariants: product.variants,
    productTags: product.tags,
    region: region,
  });

  // Format helper (amount is in cents, convert to dollars)
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100); // Convert from cents to dollars

  // Compute price data
  const getPriceData = (): VariantPrice | undefined => {
    let priceAmount: number | undefined;
    let currencyCode = region?.currency_code ?? "USD"; // Use region's currency code, default to "USD"
    let msrp: number | undefined;
    let isSale = false;
    let discountPercentage: string | undefined;

    if (variant?.prices?.length) {
      const p = variant.prices.find(
        (price) => price.currency_code.toLowerCase() === currencyCode.toLowerCase()
      );
      if (!p) {
        console.warn("No price found for currency:", {
          variantId: variant.id,
          currency: currencyCode,
        });
        return undefined;
      }
      priceAmount = p.amount; // Amount in cents
      currencyCode = p.currency_code;
      msrp =
        variant.metadata?.msrp !== undefined ? variant.metadata.msrp : undefined;
    } else {
      const all = product.variants ?? [];
      const priced = all.filter(
        (v): v is StoreVariantWithPrices & { prices: PriceEntry[] } =>
          Array.isArray(v.prices) && v.prices.length > 0
      );
      if (!priced.length) {
        console.warn("No priced variants found for product:", { productId: product.id });
        return undefined;
      }

      let cheapest: StoreVariantWithPrices | undefined;
      let lowestPrice = Number.MAX_SAFE_INTEGER;
      priced.forEach((v) => {
        const price = v.prices.find(
          (p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase()
        );
        if (price && price.amount < lowestPrice) {
          lowestPrice = price.amount;
          cheapest = v;
        }
      });

      if (!cheapest || !cheapest.prices) {
        console.warn("No variant found with price for currency:", {
          productId: product.id,
          currency: currencyCode,
        });
        return undefined;
      }

      const p = cheapest.prices.find(
        (price) => price.currency_code.toLowerCase() === currencyCode.toLowerCase()
      );
      if (!p) {
        console.warn("No price found for currency after filtering:", {
          productId: product.id,
          currency: currencyCode,
        });
        return undefined;
      }

      priceAmount = p.amount; // Amount in cents
      currencyCode = p.currency_code;
      msrp =
        cheapest.metadata?.msrp !== undefined ? cheapest.metadata.msrp : undefined;
    }

    // Sale logic
    if (priceAmount !== undefined && msrp !== undefined && priceAmount < msrp) {
      isSale = true;
      const pct = ((msrp - priceAmount) / msrp) * 100;
      discountPercentage = Math.round(pct).toString();
    } else if (
      priceAmount !== undefined &&
      product.tags?.some((t) => t.value.includes("SALE"))
    ) {
      const saleTag = product.tags.find((t) => t.value.match(/SALE(\d+)/));
      const m = saleTag?.value.match(/SALE(\d+)/);
      if (m) {
        isSale = true;
        discountPercentage = m[1];
        msrp = priceAmount / (1 - parseInt(m[1], 10) / 100);
      }
    }

    if (priceAmount === undefined) {
      console.warn("Price amount undefined for product:", { productId: product.id });
      return undefined;
    }

    return {
      calculated_price: formatPrice(priceAmount, currencyCode),
      original_price: msrp ? formatPrice(msrp, currencyCode) : "",
      price_type: isSale ? "sale" : "default",
      percentage_diff: discountPercentage ?? "",
      calculated_price_number: priceAmount / 100, // Convert to dollars
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
      {/* Current price */}
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

      {/* Original price, only on sale */}
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