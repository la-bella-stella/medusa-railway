module.exports = async (product) => {
    return {
      ...product,
      collection_id: product.collection_id,
      collection: product.collection ?? null,
      categories: product.categories ?? [],
      tags: product.tags ?? [],
      options: product.options ?? [],
      variants: product.variants ?? [],
      images: product.images ?? [],
      prices: product.variants?.flatMap((v) =>
        v.prices?.map((p) => p.amount / 100) ?? []
      ),
      size: product.options
        ?.find((o) => o.title.toLowerCase() === "size")
        ?.values?.map((v) => v.value) ?? [],
      color: product.options
        ?.find((o) => o.title.toLowerCase() === "color")
        ?.values?.map((v) => v.value) ?? [],
      brand: product.collection,
      season: product.metadata?.season ?? null,
      gender: product.metadata?.gender ?? null,
    }
  }
  