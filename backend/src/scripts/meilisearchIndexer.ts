import { MedusaContainer } from "@medusajs/framework";
import { QueryContext, SearchUtils } from "@medusajs/framework/utils";
import { MeiliSearchService } from "@rokmohar/medusa-plugin-meilisearch";

const BATCH_SIZE = 20;
const region_id = "reg_01JVDHXWGRAG2DCGP3894QA4WX";
const currency_code = "usd";

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

export default async function reindexProducts({ container }: { container: MedusaContainer }): Promise<void> {
  try {
    const query = container.resolve("query");
    const meiliSearchService: MeiliSearchService = container.resolve("meilisearch");

    let skip = 0;
    let hasMore = true;
    let totalIndexed = 0;

    while (hasMore) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["*", "variants.*", "variants.prices.*", "variants.calculated_price.*", "variants.options.*", "variants.inventory_quantity", "variants.allow_backorder", "variants.manage_inventory", "metadata", "tags.*", "options.*", "images.*", "categories.*", "type.*", "collection.*"],
        pagination: {
          take: BATCH_SIZE,
          skip,
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
        hasMore = false;
        break;
      }

      const transformed = await Promise.all(products.map(mapProductToMeiliSearch));
      await meiliSearchService.addDocuments("products", transformed);

      console.log(`✅ Indexed ${transformed.length} products [${skip}–${skip + transformed.length}]`);
      totalIndexed += transformed.length;
      skip += BATCH_SIZE;
    }

    console.log(`\n🎉 Reindex complete. Total products indexed: ${totalIndexed}`);
  } catch (error: any) {
    console.error("❌ Error during reindexing:", error.message);
    throw error;
  }
}
