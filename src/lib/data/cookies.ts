"use server";
import "server-only";
import { cookies as nextCookies } from "next/headers";

/**
 * Return `{ authorization: "Bearer …" }` if the _medusa_jwt cookie is present,
 * otherwise `{}`.  Safe to call during SSG/ISR.
 */
export const getAuthHeaders = async (): Promise<{ authorization: string } | {}> => {
  try {
    const cookieStore = await nextCookies();
    const token = cookieStore.get("_medusa_jwt")?.value;
    if (token) {
      return { authorization: `Bearer ${token}` };
    }
  } catch {
    // outside of a request context
  }
  return {};
};

/**
 * Compute a cache tag key like `"<tag>-<cacheId>"` from the `_medusa_cache_id` cookie,
 * or return `""` if missing or uncallable.
 */
export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookieStore = await nextCookies();
    const cacheId = cookieStore.get("_medusa_cache_id")?.value;
    return cacheId ? `${tag}-${cacheId}` : "";
  } catch {
    return "";
  }
};

/**
 * Return `{ tags: [ "<tag>-<cacheId>" ] }` for use in `fetch(..., { next: { tags: […] } })`,
 * or `{}` on the client or if unavailable.
 */
export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {};
  }
  try {
    const cacheTag = await getCacheTag(tag);
    return cacheTag ? { tags: [cacheTag] } : {};
  } catch {
    return {};
  }
};

/**
 * Read the `_medusa_cart_id` cookie, or `null` if absent / uncallable.
 */
export const getCartId = async (): Promise<string | null> => {
  try {
    const cookieStore = await nextCookies();
    return cookieStore.get("_medusa_cart_id")?.value ?? null;
  } catch {
    return null;
  }
};

/**
 * Set the `_medusa_cart_id` cookie.  Silently no-ops if outside a request.
 */
export const setCartId = async (cartId: string): Promise<void> => {
  try {
    const cookieStore = await nextCookies();
    cookieStore.set("_medusa_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    // ignore
  }
};

/**
 * Clear the `_medusa_cart_id` cookie.  Silently no-ops if outside a request.
 */
export const removeCartId = async (): Promise<void> => {
  try {
    const cookieStore = await nextCookies();
    cookieStore.set("_medusa_cart_id", "", { maxAge: -1 });
  } catch {
    // ignore
  }
};

/**
 * Set the `_medusa_jwt` cookie.  Silently no-ops if outside a request.
 */
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    const cookieStore = await nextCookies();
    cookieStore.set("_medusa_jwt", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    // ignore
  }
};

/**
 * Clear the `_medusa_jwt` cookie.  Silently no-ops if outside a request.
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    const cookieStore = await nextCookies();
    cookieStore.set("_medusa_jwt", "", { maxAge: -1 });
  } catch {
    // ignore
  }
};