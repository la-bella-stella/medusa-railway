// src/modules/products/components/product-onboarding-cta/index.tsx
"use client"; // Mark as a Client Component
import React from "react";
import { Button, Container, Text } from "@medusajs/ui";

// Utility function to get a cookie by name (client-side)
const getCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined; // Avoid running on the server
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

function ProductOnboardingCta() {
  // Fetch the cookie client-side
  const isOnboarding = getCookie("_medusa_onboarding") === "true";

  if (!isOnboarding) {
    return null;
  }

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          Your demo product was successfully created! 🎉
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          You can now continue setting up your store in the admin.
        </Text>
        <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
          <Button className="w-full">Continue setup in admin</Button>
        </a>
      </div>
    </Container>
  );
}

export default ProductOnboardingCta;