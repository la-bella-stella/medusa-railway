import React from "react";
import { retrieveCustomer } from "@lib/data/customer";
import { Toaster } from "@medusajs/ui";
import AccountLayout from "@modules/account/templates/account-layout";

export default async function AccountPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await retrieveCustomer().catch(() => null);

  return (
    <div className="min-h-screen bg-white lg:pt-28">
      <AccountLayout customer={customer}>
        {children}
        <Toaster />
      </AccountLayout>
    </div>
  );
}