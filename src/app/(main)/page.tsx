// src/app/(main)/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { renderHomepage } from "@lib/homepage";

export const metadata: Metadata = {
  title: "Your Store Name",
  description: "A performant ecommerce frontend with Next.js 15 and Medusa.",
};

export default async function Home() {
  const homepage = await renderHomepage();
  return (
    <Suspense fallback={<div>Loading your homepage...</div>}>
      {homepage}
    </Suspense>
  );
}