const { MeiliSearch } = require("meilisearch");
const Medusa = require("@medusajs/medusa-js").default;
require("dotenv").config();

(async () => {
  // Initialize Meilisearch client
  const searchClient = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || "https://meilisearch-production-f06a.up.railway.app",
    apiKey: process.env.MEILISEARCH_API_KEY || "4enxqnhq1h1wijmzgt0mellwsv7digsm",
  });
  const index = searchClient.index("products");

  // Initialize Medusa client with admin authentication
  const medusa = new Medusa({
    baseUrl: process.env.MEDUSA_BACKEND_URL || "https://backend-production-3da01.up.railway.app",
    maxRetries: 3,
    apiToken: process.env.MEDUSA_API_TOKEN, // Admin API token
  });

  try {
    // Fetch products with relations
    const { products } = await medusa.admin.products.list({
      expand: "variants,options,collection,categories",
      limit: 1000, // Adjust based on your dataset
    });

    // Transform products for Meilisearch
    const transformedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      handle: product.handle,
      weight: product.weight,
      length: product.length,
      height: product.height,
      width: product.width,
      collection_id: product.collection_id,
      brand: product.collection?.title || null, // Use collection.title as brand
      collection: product.collection
        ? {
            id: product.collection.id,
            title: product.collection.title,
            handle: product.collection.handle,
          }
        : null,
      categories: product.categories
        ?.filter((cat) => cat.is_active)
        .map((cat) => cat.name) || [], // Extract active category names
      metadata: product.metadata || {}, // Includes style, gender, season, hs_code, materials, size_code
      variants: product.variants.map((variant) => ({
        id: variant.id,
        size: product.options
          ?.find((opt) => opt.title.toLowerCase() === "size")
          ?.values.find((val) => val.variant_id === variant.id)?.value || null,
        color: variant.metadata?.color_facet || null,
        price:
          variant.prices?.find((p) => p.currency_code === "USD")?.amount / 100 ||
          null, // Adjust currency
        inventory_quantity: variant.inventory_quantity,
        metadata: variant.metadata || {}, // Includes msrp, image, supplier, color_facet
      })),
    }));

    // Index products
    console.log("Indexing products...");
    const indexingTask = await index.addDocuments(transformedProducts);
    await searchClient.waitForTask(indexingTask.taskUid);
    console.log("Products indexed successfully");

    // Update filterable attributes
    const filterableAttributes = [
      "categories",
      "brand",
      "variants.price",
      "variants.color",
      "variants.size",
      "metadata.gender",
      "metadata.season",
      "metadata.style",
      "variants.metadata.msrp",
      "variants.metadata.supplier",
    ];
    console.log("Updating filterable attributes...");
    const attributesTask = await index.updateFilterableAttributes(
      filterableAttributes
    );
    await searchClient.waitForTask(attributesTask.taskUid);
    console.log("Filterable attributes updated:", filterableAttributes);

    // Verify settings
    const settings = await index.getSettings();
    console.log("Current filterable attributes:", settings.filterableAttributes);
  } catch (error) {
    console.error("Error indexing products:", error);
  }
})();