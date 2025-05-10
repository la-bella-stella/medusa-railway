"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

interface AccountNavProps {
  customer: HttpTypes.StoreCustomer | null
}

const AccountNav = ({ customer }: AccountNavProps) => {
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  // TODO: add  countryCode to the base URL
  const base = `/account/dashboard`

  const isActive = (href: string) => pathname === href


  const navItems = [
    {
      label: "Account",
      href: '/account',
      icon: null,
    },
    {
      label: "Overview",
      href: base,
      icon: null,
    },
    {
      label: "Orders",
      href: `${base}/orders`,
      icon: <Package className="w-5 h-5 text-gray-400" />,
    },
    {
      label: "Addresses",
      href: `${base}/addresses`,
      icon: <MapPin className="w-5 h-5 text-gray-400" />,
    },
    {
      label: "Profile",
      href: `${base}/profile`,
      icon: <User className="w-5 h-5 text-gray-400" />,
    },
  ]

  const handleLogout = async () => {
    await signout()
  }

  return (
    <nav className="w-full font-['Inter',sans-serif]">
      {/* Mobile */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        {pathname !== base ? (
          <LocalizedClientLink
            href={base}
            className="flex items-center gap-x-2 text-sm px-4 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
            data-testid="account-main-link"
          >
            <ChevronDown className="rotate-90 w-4 h-4 text-gray-500" />
            <span>Account</span>
          </LocalizedClientLink>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-5 py-4 text-base font-semibold text-gray-900 border-b border-gray-200">
              Hello {customer?.first_name}
            </div>
            <ul className="divide-y divide-gray-200">
              {navItems.slice(1).map(({ href, label, icon }) => (
                <li key={href}>
                  <LocalizedClientLink
                    href={href}
                    data-testid={`${label.toLowerCase()}-link`}
                    className={clx(
                      "flex justify-between items-center px-5 py-4 text-sm font-medium",
                      isActive(href)
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      {icon}
                      <span>{label}</span>
                    </div>
                    <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400" />
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                  className="w-full text-left px-5 py-4 text-sm flex justify-between items-center text-red-600 hover:bg-gray-50 hover:text-red-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-x-3">
                    <ArrowRightOnRectangle className="w-5 h-5" />
                    <span>Log out</span>
                  </div>
                  <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400" />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden small:block" data-testid="account-nav">
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <span className="text-base font-semibold text-gray-900 mb-4">
            Account Menu
          </span>
          <ul className="space-y-1">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <LocalizedClientLink
                  href={href}
                  data-testid={`${label.toLowerCase()}-link`}
                  className={clx(
                    "block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive(href)
                      ? "bg-gray-100 text-gray-900 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isActive(href) && "pl-4 border-l-2 border-gray-900"
                  )}
                >
                  {label}
                </LocalizedClientLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className="w-full text-left text-sm text-red-600 px-3 py-2 rounded-md hover:bg-gray-50 hover:text-red-700 transition-all duration-200 mt-2"
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default AccountNav