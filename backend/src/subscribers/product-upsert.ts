import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { QueryContext, Modules } from "@medusajs/framework/utils";
import { MeiliSearchService } from "@rokmohar/medusa-plugin-meilisearch";
import { SearchUtils } from "@medusajs/framework/utils";

async function mapProductToMeiliSearch(product) {
  const variants = product.variants ?? [];

  const color = [...new Set(variants.map((v) => v.metadata?.color_facet).filter((c) => typeof c === "string"))];

  const size = [...new Set(variants.flatMap((v) => (v.options ?? []).filter((opt) => opt.option?.title?.toLowerCase() === "size").map((opt) => opt.value)))];

  const prices = variants.flatMap(
    (variant) =>
      variant.prices?.map((p) => ({
        amount: p.amount,
        currency_code: p.currency_code,
      })) ?? []
  );

  const cheapestVariant = variants
    .filter((v) => v.prices && v.prices.length > 0)
    .sort((a, b) => {
      const aPrice = Math.min(...a.prices.map((p) => p.amount));
      const bPrice = Math.min(...b.prices.map((p) => p.amount));
      return aPrice - bPrice;
    })[0];

  const price = cheapestVariant?.prices ? Math.min(...cheapestVariant.prices.map((p) => p.amount)) : null;

  const msrp = cheapestVariant?.metadata?.msrp ?? null;

  const discountPercentage = price && msrp && msrp > price ? Math.round(100 - (price / msrp) * 100) : null;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    collection: product.collection ?? null,
    categories: product.categories ?? [],
    tags: product.tags.map((tag) => tag.value) ?? [],
    images: product.images?.map((img) => img.url) ?? [],
    variants: variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      prices: v.prices ?? [],
      metadata: v.metadata ?? {},
    })),
    prices,
    color,
    size,
    vendor: product.collection?.title ?? null,
    price,
    originalPrice: msrp,
    discountPercentage,
    metadata: product.metadata ?? {},
  };
}

export default async function productUpsertHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const productId = data.id;
  const meiliSearchService: MeiliSearchService = container.resolve("meilisearch");
  const query = container.resolve("query");

  const region_id = "reg_01JV62N5VTWTWYGTYT91JE39Q1";
  const currency_code = "usd";

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["*", "variants.*", "variants.prices.*", "variants.calculated_price.*", "variants.options.*", "variants.inventory_quantity", "variants.allow_backorder", "variants.manage_inventory", "metadata", "tags.*", "options.*", "images.*", "categories.*", "type.*", "collection.*"],
    filters: {
      id: [productId],
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id,
          currency_code,
        }),
      },
    },
  });

  if (!products || products.length === 0) {
    console.log("ℹ️ No product found for indexing.");
    return;
  }

  let product = await mapProductToMeiliSearch(products[0]);
  await meiliSearchService.addDocuments("products", [product]);
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
};
