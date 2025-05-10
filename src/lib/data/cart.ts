"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

// Re-export getCartId to resolve TypeScript error
export { getCartId }

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) {
    console.warn("retrieveCart: No cart ID provided or found in cookies")
    return null // Return null for initial load without cart
  }

  const headers = await getAuthHeaders()
  const next = await getCacheOptions("carts")

  try {
    const response = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
      `/store/carts/${id}`,
      {
        method: "GET",
        query: {
          fields:
            "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    const { cart } = response
    if (cart && cart.currency_code) {
      cart.currency_code = cart.currency_code.toUpperCase() // Normalize to USD
    }
    return cart
  } catch (e: unknown) {
    const errorDetails = {
      cartId: id,
      message: e instanceof Error ? e.message : "Unknown error fetching cart",
      status: e && typeof e === "object" && "status" in e ? e.status : "N/A",
      response:
        e && typeof e === "object" && "response" in e
          ? JSON.stringify(e.response)
          : "No response",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("retrieveCart: Failed to fetch cart", errorDetails)
    return null // Return null to avoid breaking routing
  }
}

/**
 * Get or create a cart, scoped to the given countryCode → region.
 */
export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)
  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()
  const headers = await getAuthHeaders()

  if (!cart) {
    try {
      const { cart: newCart } = await sdk.store.cart.create(
        { region_id: region.id },
        {},
        headers
      )
      cart = newCart
      await setCartId(cart.id)
      revalidateTag(await getCacheTag("carts"))
    } catch (e: unknown) {
      const errorDetails = {
        regionId: region.id,
        message: e instanceof Error ? e.message : "Unknown error creating cart",
        stack: e instanceof Error ? e.stack : undefined,
        rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
      }
      console.error("getOrSetCart: Failed to create cart", errorDetails)
      throw new Error(`Failed to create cart: ${errorDetails.message}`)
    }
  }

  if (cart.region_id !== region.id) {
    try {
      await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
      revalidateTag(await getCacheTag("carts"))
    } catch (e: unknown) {
      const errorDetails = {
        cartId: cart.id,
        regionId: region.id,
        message:
          e instanceof Error
            ? e.message
            : "Unknown error updating cart region",
        stack: e instanceof Error ? e.stack : undefined,
        rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
      }
      console.error("getOrSetCart: Failed to update cart region", errorDetails)
      throw new Error(`Failed to update cart region: ${errorDetails.message}`)
    }
  }

  if (cart && cart.currency_code) {
    cart.currency_code = cart.currency_code.toUpperCase() // Normalize to USD
  }
  return cart
}

/**
 * Update cart metadata or items.
 */
export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error(
      "No existing cart found, please create one before updating"
    )
  }
  const headers = await getAuthHeaders()

  try {
    const { cart } = await sdk.store.cart.update(cartId, data, {}, headers)
    if (cart && cart.currency_code) {
      cart.currency_code = cart.currency_code.toUpperCase() // Normalize to USD
    }
    revalidateTag(await getCacheTag("carts"))
    revalidateTag(await getCacheTag("fulfillment"))
    return cart
  } catch (e: unknown) {
    const errorDetails = {
      cartId,
      message: e instanceof Error ? e.message : "Unknown error updating cart",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("updateCart: Failed to update cart", errorDetails)
    throw medusaError(e)
  }
}

/**
 * Add a line item (product variant) to the cart.
 */
export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = await getAuthHeaders()
  try {
    await sdk.store.cart.createLineItem(
      cart.id,
      { variant_id: variantId, quantity },
      {},
      headers
    )
    revalidateTag(await getCacheTag("carts"))
    revalidateTag(await getCacheTag("fulfillment"))
  } catch (e: unknown) {
    const errorDetails = {
      cartId: cart.id,
      variantId,
      message:
        e instanceof Error ? e.message : "Unknown error adding to cart",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("addToCart: Failed to add item to cart", errorDetails)
    throw medusaError(e)
  }
}

/**
 * Update quantity for a line item.
 */
export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }
  const headers = await getAuthHeaders()

  try {
    await sdk.store.cart.updateLineItem(
      cartId,
      lineId,
      { quantity },
      {},
      headers
    )
    revalidateTag(await getCacheTag("carts"))
    revalidateTag(await getCacheTag("fulfillment"))
  } catch (e: unknown) {
    const errorDetails = {
      cartId,
      lineId,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error updating line item",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("updateLineItem: Failed to update line item", errorDetails)
    throw medusaError(e)
  }
}

/**
 * Delete a line item.
 */
export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }
  const headers = await getAuthHeaders()

  try {
    await sdk.store.cart.deleteLineItem(cartId, lineId, headers)
    revalidateTag(await getCacheTag("carts"))
    revalidateTag(await getCacheTag("fulfillment"))
  } catch (e: unknown) {
    const errorDetails = {
      cartId,
      lineId,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error deleting line item",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("deleteLineItem: Failed to delete line item", errorDetails)
    throw medusaError(e)
  }
}

/**
 * Set shipping method on the cart.
 */
export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = await getAuthHeaders()
  try {
    await sdk.store.cart.addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      headers
    )
    revalidateTag(await getCacheTag("carts"))
  } catch (e: unknown) {
    const errorDetails = {
      cartId,
      shippingMethodId,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error setting shipping method",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error(
      "setShippingMethod: Failed to set shipping method",
      errorDetails
    )
    throw medusaError(e)
  }
}

/**
 * Initiate payment session for the cart.
 */
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = await getAuthHeaders()
  try {
    const resp = await sdk.store.payment.initiatePaymentSession(
      cart,
      data,
      {},
      headers
    )
    revalidateTag(await getCacheTag("carts"))
    return resp
  } catch (e: unknown) {
    const errorDetails = {
      cartId: cart.id,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error initiating payment session",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error(
      "initiatePaymentSession: Failed to initiate payment session",
      errorDetails
    )
    throw medusaError(e)
  }
}

/**
 * Apply promotion codes.
 */
export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found")
  }
  const headers = await getAuthHeaders()
  try {
    await sdk.store.cart.update(cartId, { promo_codes: codes }, {}, headers)
    revalidateTag(await getCacheTag("carts"))
    revalidateTag(await getCacheTag("fulfillment"))
  } catch (e: unknown) {
    const errorDetails = {
      cartId,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error applying promotions",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error(
      "applyPromotions: Failed to apply promotions",
      errorDetails
    )
    throw medusaError(e)
  }
}

/**
 * Submit promotion form.
 */
export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: unknown) {
    const errorDetails = {
      message:
        e instanceof Error
          ? e.message
          : "Unknown error submitting promotion form",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error(
      "submitPromotionForm: Failed to submit promotion form",
      errorDetails
    )
    return errorDetails.message
  }
}

/**
 * Set shipping & billing addresses, then redirect to delivery step.
 */
export async function setAddresses(currentState: unknown, formData: FormData) {
  if (!formData) {
    return "No form data found when setting addresses"
  }

  const cartId = await getCartId()
  if (!cartId) {
    return "No cart ID found when setting addresses"
  }

  const cart = await retrieveCart(cartId)
  console.log("setAddresses cart:", { cartId, region_id: cart?.region_id, region: cart?.region })

  const data: any = {
    shipping_address: {
      first_name: formData.get("shipping_address.first_name"),
      last_name: formData.get("shipping_address.last_name"),
      address_1: formData.get("shipping_address.address_1"),
      address_2: "",
      company: formData.get("shipping_address.company"),
      postal_code: formData.get("shipping_address.postal_code"),
      city: formData.get("shipping_address.city"),
      country_code:
        formData
          .get("shipping_address.country_code")
          ?.toString()
          || "",
      province: formData.get("shipping_address.province"),
      phone: formData.get("shipping_address.phone"),
    },
    email: formData.get("email"),
  }

  const sameAsBilling = formData.get("same_as_billing")
  if (sameAsBilling === "on") {
    data.billing_address = data.shipping_address
  } else {
    data.billing_address = {
      first_name: formData.get("billing_address.first_name"),
      last_name: formData.get("billing_address.last_name"),
      address_1: formData.get("billing_address.address_1"),
      address_2: "",
      company: formData.get("billing_address.company"),
      postal_code: formData.get("billing_address.postal_code"),
      city: formData.get("billing_address.city"),
      country_code:
        formData
          .get("billing_address.country_code")
          ?.toString()
           || "",
      province: formData.get("billing_address.province"),
      phone: formData.get("billing_address.phone"),
    }
  }

  console.log("setAddresses payload:", { cartId, data })

  try {
    await updateCart(data)
    // DROP the countryCode prefix on checkout
    redirect(`/checkout?step=delivery`)
  } catch (e: unknown) {
    const errorDetails = {
      cartId,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error setting addresses",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("setAddresses: Failed to set addresses", errorDetails)
    return errorDetails.message
  }
}

/**
 * Place the order, clear cart, and redirect to confirmation.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }
  const headers = await getAuthHeaders()

  try {
    const cartRes = await sdk.store.cart.complete(id, {}, headers)
      .then(async (res) => {
        revalidateTag(await getCacheTag("carts"))
        return res
      })
      .catch(medusaError)

    if (cartRes?.type === "order") {
      revalidateTag(await getCacheTag("orders"))
      removeCartId()
      // DROP the countryCode prefix on order confirmation
      redirect(`/order/${cartRes.order.id}/confirmed`)
    }

    return cartRes.cart
  } catch (e: unknown) {
    const errorDetails = {
      cartId: id,
      message:
        e instanceof Error
          ? e.message
          : "Unknown error placing order",
      stack: e instanceof Error ? e.stack : undefined,
      rawError: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    }
    console.error("placeOrder: Failed to place order", errorDetails)
    throw medusaError(e)
  }
}

/**
 * Update region (e.g. on language switch), then reload same path.
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)
  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }
  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag(await getCacheTag("carts"))
  }
  revalidateTag(await getCacheTag("regions"))
  revalidateTag(await getCacheTag("products"))
  // DROP the countryCode segment entirely
  redirect(currentPath)
}

/**
 * Fetch shipping options for the cart.
 */
export async function listCartOptions() {
  const cartId = await getCartId()
  if (!cartId) {
    console.warn(
      "listCartOptions: No cart ID provided or found in cookies"
    )
    return [] // Return empty array for missing cartId
  }

  try {
    const { shipping_options } =
      await sdk.store.fulfillment.listCartOptions({
        cart_id: cartId,
      })
    return shipping_options || []
  } catch (e: unknown) {
    console.error(
      "listCartOptions: Failed to fetch shipping options",
      e
    )
    return [] // Return empty array to avoid breaking downstream components
  }
}