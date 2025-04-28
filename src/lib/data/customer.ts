// src/modules/common/actions/customer.ts
"use server";

import { sdk } from "@lib/config";
import medusaError from "@lib/util/medusa-error";
import { HttpTypes } from "@medusajs/types";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies";

/**
 * Retrieves the currently authenticated customer, or null if none.
 */
export const retrieveCustomer = async (): Promise<HttpTypes.StoreCustomer | null> => {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders) return null;

  const headers = { ...authHeaders };
  const next = { ...(await getCacheOptions("customers")) };

  try {
    const { customer } = await sdk.client.fetch<{ customer: HttpTypes.StoreCustomer }>(
      `/store/customers/me`,
      {
        method: "GET",
        query: { fields: "*orders" },
        headers,
        next,
        cache: "force-cache",
      }
    );
    return customer;
  } catch {
    return null;
  }
};

/**
 * Updates customer details.
 */
export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = { ...(await getAuthHeaders()) };
  try {
    const { customer } = await sdk.store.customer.update(body, {}, headers);
    revalidateTag(await getCacheTag("customers"));
    return customer;
  } catch (e) {
    throw medusaError(e);
  }
};

/**
 * Sign up a new customer and log them in.
 */
export async function signup(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const customerForm = {
    email,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  };

  try {
    // Register and store token
    const token = (await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })) as string;
    await setAuthToken(token);

    // Create the customer record
    const headers = { ...(await getAuthHeaders()) };
    await sdk.store.customer.create(customerForm, {}, headers);

    // Log in again to refresh token
    const loginToken = (await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })) as string;
    await setAuthToken(loginToken);

    // Revalidate cache and transfer cart
    revalidateTag(await getCacheTag("customers"));
    const cartId = await getCartId();
    if (cartId) {
      const transferHeaders = { ...(await getAuthHeaders()) };
      await sdk.store.cart.transferCart(cartId, {}, transferHeaders);
      revalidateTag(await getCacheTag("carts"));
    }

    // Finally, redirect into the account dashboard
    redirect("/account");
  } catch (error: any) {
    return error.toString();
  }
}

/**
 * Log in an existing customer.
 */
export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const token = (await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })) as string;
    await setAuthToken(token);
    revalidateTag(await getCacheTag("customers"));
  } catch (error: any) {
    return error.toString();
  }

  try {
    const cartId = await getCartId();
    if (cartId) {
      const headers = { ...(await getAuthHeaders()) };
      await sdk.store.cart.transferCart(cartId, {}, headers);
      revalidateTag(await getCacheTag("carts"));
    }
  } catch (error: any) {
    return error.toString();
  }
}

/**
 * Sign out the current customer and clear their cart.
 * Redirects to /account (no locale prefix).
 */
export async function signout() {
  await sdk.auth.logout();
  await removeAuthToken();
  revalidateTag(await getCacheTag("customers"));

  await removeCartId();
  revalidateTag(await getCacheTag("carts"));

  redirect("/account");
}

/**
 * Transfers any existing guest cart to the authenticated customer.
 */
export async function transferCart() {
  const cartId = await getCartId();
  if (!cartId) return;

  const headers = { ...(await getAuthHeaders()) };
  await sdk.store.cart.transferCart(cartId, {}, headers);
  revalidateTag(await getCacheTag("carts"));
}

/**
 * Add a new address for the customer.
 */
export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false;
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false;

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  };

  const headers = { ...(await getAuthHeaders()) };
  try {
    await sdk.store.customer.createAddress(address, {}, headers);
    revalidateTag(await getCacheTag("customers"));
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.toString() };
  }
};

/**
 * Delete a customer address by its ID.
 */
export const deleteCustomerAddress = async (
  addressId: string
): Promise<{ success: boolean; error: string | null }> => {
  const headers = { ...(await getAuthHeaders()) };
  try {
    await sdk.store.customer.deleteAddress(addressId, headers);
    revalidateTag(await getCacheTag("customers"));
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.toString() };
  }
};

/**
 * Update an existing customer address.
 */
export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string);
  if (!addressId) {
    return { success: false, error: "Address ID is required" };
  }

  const address: HttpTypes.StoreUpdateCustomerAddress = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  };

  const phone = formData.get("phone") as string;
  if (phone) {
    address.phone = phone;
  }

  const headers = { ...(await getAuthHeaders()) };
  try {
    await sdk.store.customer.updateAddress(addressId, address, {}, headers);
    revalidateTag(await getCacheTag("customers"));
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.toString() };
  }
};
