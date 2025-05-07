import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Define minimal interfaces for types
interface Product {
  id: string
  title: string
  subtitle?: string
  handle: string
  is_giftcard: boolean
  status: string
  tags: { id: string }[]
  categories: { id: string }[]
  options: ProductOption[]
  variants: ProductVariant[]
  metadata: { [key: string]: any }
  images: { url: string; metadata: { position: number } }[]
}

interface ProductOption {
  id: string
  title: string
  values: string[]
}

interface ProductVariant {
  id: string
  title: string
  sku: string
  allow_backorder: boolean
  manage_inventory: boolean
  options: { title: string; value: string }[]
  prices: { amount: number; currency_code: string }[]
  metadata: { [key: string]: any }
}

// Define interfaces for services
interface ProductService {
  retrieveByHandle(handle: string, options: { relations: string[] }): Promise<Product | null>
  create(data: Partial<Product>): Promise<Product>
  update(id: string, data: Partial<Product>): Promise<Product>
  updateImages(id: string, images: { url: string; metadata: { position: number } }[]): Promise<void>
  listOptions(productId: string): Promise<ProductOption[]>
  listOptionValues(optionId: string): Promise<string[]>
  addOptionValues(optionId: string, values: string[]): Promise<void>
  createOption(productId: string, data: { title: string; values: string[] }): Promise<ProductOption>
  listVariants(filter: { product_id: string }): Promise<ProductVariant[]>
  retrieve(id: string, options: { relations: string[] }): Promise<Product>
}

interface ProductVariantService {
  create(productId: string, data: Partial<ProductVariant>): Promise<ProductVariant>
  update(id: string, data: Partial<ProductVariant>): Promise<ProductVariant>
}

interface InventoryService {
  retrieveBySKU(sku: string, options: { relations: string[] }): Promise<any | null>
  createInventoryItem(data: { sku: string; metadata: any }): Promise<any>
  createInventoryLevel(inventoryItemId: string, locationId: string, quantity: number): Promise<void>
  updateInventoryLevel(inventoryItemId: string, locationId: string, data: { stocked_quantity: number }): Promise<void>
}

type ProductUpsertData = {
  title: string
  subtitle?: string
  handle: string
  is_giftcard: boolean
  status: string
  tags: { id: string }[]
  categories: { id: string }[]
  options: { title: string; values: string[] }[]
  variants: {
    title: string
    sku: string
    prices: { amount: number; raw_amount: number; currency_code: string }[]
    allow_backorder: boolean
    manage_inventory: boolean
    options: { [key: string]: string }
    inventory: { quantity: number; location_id: string }[]
    metadata: { [key: string]: any }
  }[]
  metadata: { [key: string]: any }
  images: { url: string; position: number }[]
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const connection = req.scope.resolve("connection") // Resolve database connection
  const productService = req.scope.resolve<ProductService>("productService")
  const variantService = req.scope.resolve<ProductVariantService>("productVariantService")
  const inventoryService = req.scope.resolve<InventoryService>("inventoryService")

  try {
    const productData: ProductUpsertData = req.body

    // Run in a transaction using the connection
    const result = await connection.transaction(async (transactionalManager) => {
      const {
        title,
        subtitle,
        handle,
        is_giftcard,
        status,
        tags,
        categories,
        options,
        variants,
        metadata,
        images,
      } = productData

      // Check if product exists by handle
      let product = await productService
        .retrieveByHandle(handle, { relations: ["options", "variants", "tags", "categories"] })
        .catch(() => null)

      // Prepare product data
      const productUpdate: Partial<Product> = {
        title,
        subtitle,
        handle,
        is_giftcard,
        status,
        metadata,
        tags: tags.map((tag) => ({ id: tag.id })),
        categories: categories.map((category) => ({ id: category.id })),
      }

      // Create or update product
      if (!product) {
        product = await productService.create(productUpdate)
      } else {
        product = await productService.update(product.id, productUpdate)
      }

      // Handle images
      if (images && images.length) {
        await productService.updateImages(product.id, images.map((img) => ({
          url: img.url,
          metadata: { position: img.position },
        })))
      }

      // Handle options
      const existingOptions = await productService.listOptions(product.id)
      for (const option of options) {
        const existingOption = existingOptions.find((o) => o.title === option.title)
        if (!existingOption) {
          await productService.createOption(product.id, {
            title: option.title,
            values: option.values,
          })
        } else {
          const currentValues = await productService.listOptionValues(existingOption.id)
          const newValues = option.values.filter((v) => !currentValues.includes(v))
          if (newValues.length) {
            await productService.addOptionValues(existingOption.id, newValues)
          }
        }
      }

      // Handle variants
      const existingVariants = await productService.listVariants({ product_id: product.id })
      for (const variant of variants) {
        const existingVariant = existingVariants.find((v) => v.sku === variant.sku)

        const variantData: Partial<ProductVariant> = {
          title: variant.title,
          sku: variant.sku,
          allow_backorder: variant.allow_backorder,
          manage_inventory: variant.manage_inventory,
          options: Object.entries(variant.options).map(([title, value]) => ({ title, value })),
          prices: variant.prices.map((price) => ({
            amount: price.amount,
            currency_code: price.currency_code,
          })),
          metadata: variant.metadata,
        }

        let variantId: string
        if (!existingVariant) {
          const createdVariant = await variantService.create(product.id, variantData)
          variantId = createdVariant.id
        } else {
          await variantService.update(existingVariant.id, variantData)
          variantId = existingVariant.id
        }

        // Handle inventory
        for (const inventory of variant.inventory) {
          const inventoryItem = await inventoryService
            .retrieveBySKU(variant.sku, { relations: ["inventory_levels"] })
            .catch(() => null)
          if (!inventoryItem) {
            const newInventoryItem = await inventoryService.createInventoryItem({
              sku: variant.sku,
              metadata: variant.metadata,
            })
            await inventoryService.createInventoryLevel(newInventoryItem.id, inventory.location_id, inventory.quantity)
          } else {
            const existingLevel = inventoryItem.inventory_levels.find((level) => level.location_id === inventory.location_id)
            if (existingLevel) {
              await inventoryService.updateInventoryLevel(inventoryItem.id, inventory.location_id, {
                stocked_quantity: inventory.quantity,
              })
            } else {
              await inventoryService.createInventoryLevel(inventoryItem.id, inventory.location_id, inventory.quantity)
            }
          }
        }
      }

      // Return the updated product
      return await productService.retrieve(product.id, {
        relations: ["options", "variants", "tags", "categories", "images"],
      })
    })

    res.status(200).json(result)
  } catch (error) {
    logger.error(`Error in product upsert: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
}