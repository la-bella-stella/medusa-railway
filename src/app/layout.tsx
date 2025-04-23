// src/app/layout.tsx
import { getBaseURL } from "@lib/util/env";
import { Metadata } from "next";
import "styles/globals.css";
import Nav from "@modules/layout/templates/nav";
import Footer from "@modules/layout/templates/footer";
import ClientWrapper from "./ClientWrapper";
import { Suspense } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { countryCode?: string };
}) {
  const countryCode = params?.countryCode;
  return (
    <html lang="en" data-mode="light">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <ClientWrapper>
            <Nav countryCode={countryCode} />
            <main className="relative">{children}</main>
            <Footer />
          </ClientWrapper>
        </Suspense>
      </body>
    </html>
  );
}