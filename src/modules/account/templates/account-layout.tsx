"use client"

import React from "react"
import { usePathname } from "next/navigation"
import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ customer, children }) => {
  const pathname = usePathname()
  const isAuthPage =
    pathname === "/account/login" || pathname === "/account/register"

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="w-full bg-white" data-testid="account-page">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col small:flex-row gap-12 py-12">
          {/* Sidebar */}
          {customer && (
            <aside className="w-full small:w-[240px] shrink-0">
              <AccountNav customer={customer} />
            </aside>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-10 pb-12 flex flex-col small:flex-row items-start small:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Got questions?</h3>
            <p className="text-sm text-gray-600">
              You can find frequently asked questions and answers on our customer service page.
            </p>
          </div>
          <UnderlineLink href="/customer-service">Customer Service</UnderlineLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
