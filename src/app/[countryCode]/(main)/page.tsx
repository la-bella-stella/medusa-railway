// src/app/[countryCode]/(main)/page.tsx
import { Metadata } from "next";
import { renderHomepage } from "@lib/homepage";

export const metadata: Metadata = {
  title: "Your Store Name",
  description: "A performant ecommerce frontend with Next.js 15 and Medusa.",
};

export default async function Home(props: {
  params: Promise<{ countryCode: string }>;
}) {
  const params = await props.params;
  const { countryCode } = params;

  return renderHomepage(countryCode);
}