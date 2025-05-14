// @lib/actions/checkout.ts
"use server";

import { redirect } from "next/navigation";

// Store cartId and step in a temporary server-side cache (simplified example)
// In a real app, you might use a session store or Redis for this
const checkoutStateCache: { [key: string]: { cartId: string; step: string } } = {};

export async function navigateToCheckout(cartId: string | null, step: string) {
  if (!cartId) {
    redirect("/cart");
  }

  // Generate a unique key for this navigation (e.g., a timestamp or UUID)
  const navigationKey = Date.now().toString();
  
  // Store the cartId and step in the cache
  checkoutStateCache[navigationKey] = { cartId, step };

  // Redirect to /checkout with the navigation key
  redirect(`/checkout?navKey=${navigationKey}`);
}

export async function getCheckoutState(navKey: string) {
  const state = checkoutStateCache[navKey];
  if (state) {
    // Optionally clean up the cache after retrieval
    delete checkoutStateCache[navKey];
    return state;
  }
  return null;
}