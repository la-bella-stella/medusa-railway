const { ModuleRegistrationName } = require("@medusajs/utils")
const { createMedusaContainer, initialize } = require("@medusajs/modules-sdk")
const { QueryContext } = require("@medusajs/framework/utils")

const region_id = "reg_01JSW66RFBTQRDR1PX0A3MQJP8"
const currency_code = "usd"

module.exports = async (product) => {
  console.log("product", product)
  // const container = createMedusaContainer()
  // await initialize({ container })

  // const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)

  // // Retrieve full product with relations
  // const fullProduct = await productModuleService.retrieve(product.id, {
  //   relations: [
  //     "variants",
  //     "variants.prices",
  //     "variants.calculated_price",
  //     "variants.options",
  //     "variants.options.option",
  //     "tags",
  //     "options",
  //     "images",
  //     "categories",
  //     "type",
  //     "collection",
  //   ],
  //   context: {
  //     variants: {
  //       calculated_price: QueryContext({
  //         region_id,
  //         currency_code,
  //       }),
  //     },
  //   },
  // })

  // const variants = fullProduct.variants ?? []

  // const color = [
  //   ...new Set(
  //     variants
  //       .map((v) => v.metadata?.color_facet)
  //       .filter((c) => typeof c === "string")
  //   ),
  // ]

  // const size = [
  //   ...new Set(
  //     variants.flatMap((v) =>
  //       (v.options ?? [])
  //         .filter((opt) => opt.option?.title?.toLowerCase() === "size")
  //         .map((opt) => opt.value)
  //     )
  //   ),
  // ]

  // const prices = variants.flatMap((variant) =>
  //   variant.prices?.map((p) => ({
  //     amount: p.amount,
  //     currency_code: p.currency_code,
  //   })) ?? []
  // )

  // const cheapestVariant = variants
  //   .filter((v) => v.prices && v.prices.length > 0)
  //   .sort((a, b) => {
  //     const aPrice = Math.min(...a.prices.map((p) => p.amount))
  //     const bPrice = Math.min(...b.prices.map((p) => p.amount))
  //     return aPrice - bPrice
  //   })[0]

  // const price = cheapestVariant?.prices
  //   ? Math.min(...cheapestVariant.prices.map((p) => p.amount))
  //   : null

  // const msrp = cheapestVariant?.metadata?.msrp ?? null

  // const discountPercentage =
  //   price && msrp && msrp > price
  //     ? Math.round(100 - (price / msrp) * 100)
  //     : null

  // return {
  //   id: fullProduct.id,
  //   title: fullProduct.title,
  //   handle: fullProduct.handle,
  //   thumbnail: fullProduct.thumbnail,
  //   collection: fullProduct.collection ?? null,
  //   categories: fullProduct.categories ?? [],
  //   tags: fullProduct.tags?.map((tag) => tag.value) ?? [],
  //   images: fullProduct.images?.map((img) => img.url) ?? [],
  //   variants: variants.map((v) => ({
  //     id: v.id,
  //     sku: v.sku,
  //     prices: v.prices ?? [],
  //     metadata: v.metadata ?? {},
  //   })),
  //   prices,
  //   color,
  //   size,
  //   vendor: fullProduct.collection?.title ?? null,
  //   price,
  //   originalPrice: msrp,
  //   discountPercentage,
  //   metadata: fullProduct.metadata ?? {},
  // }
}
