// src/app/(main)/account/layout.tsx
import React from "react"
import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"

export default async function AccountPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountLayout customer={customer}>
        {children}
        <Toaster />
      </AccountLayout>
    </div>
  )
}
