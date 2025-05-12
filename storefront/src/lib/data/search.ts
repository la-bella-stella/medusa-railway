import { MeiliSearch } from "meilisearch";
import type { Filters } from "types/global";

export async function search(query: string, filters: Filters = {}) {
  const client = new MeiliSearch({
    host: process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "https://meilisearch-production-f06a.up.railway.app",
    apiKey: process.env.NEXT_PUBLIC_SEARCH_API_KEY || "cfe27a4b9d38bad2cd9931f7a0e332d6a598b23d0925c5e336770f0a7a532a2c",
  });
  const index = client.index("products");

  // Map Filters to Meilisearch fields
  const filterMapping: Record<string, string> = {
    category: "categories",
    brand: "brand",
    price: "variants.metadata.msrp",
    grouped_color: "variants.color",
    gender: "metadata.gender",
    season: "metadata.season",
    tags: "metadata.style",
  };

  // Convert Filters to Meilisearch filter strings
  const meilisearchFilters = Object.entries(filters)
    .flatMap(([key, values]) =>
      values.map((value) => {
        if (key === "price") {
          const [min, max] = value.split("-").map((v) => v.trim());
          return [
            `${filterMapping[key]} >= ${min}`,
            `${filterMapping[key]} <= ${max}`,
          ];
        }
        return `${filterMapping[key]} = "${value}"`;
      })
    )
    .flat();

  try {
    const response = await index.search(query, {
      filter: meilisearchFilters.length > 0 ? meilisearchFilters.join(" AND ") : undefined,
      limit: 100,
    });
    return response.hits;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}