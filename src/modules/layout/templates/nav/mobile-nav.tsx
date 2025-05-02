"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreRegion, HttpTypes } from "@medusajs/types";
import SearchIcon from "@modules/common/icons/search-icon";
import MenuIcon from "@modules/common/icons/menu-icon";
import CartIcon from "@modules/common/icons/cart-icon";
import UserIcon from "@modules/common/icons/user";
import Logo from "@modules/common/components/logo";
import SearchOverlay from "@modules/layout/components/search";
import MobileMenu from "@modules/layout/components/mobile-menu";
import { useUI } from "@lib/context/ui-context";

interface MobileNavProps {
  regions: StoreRegion[];
  isAuthenticated: boolean;
  cart: HttpTypes.StoreCart | null;
  regionId: string;
}

export default function MobileNav({
  regions,
  isAuthenticated,
  cart,
  regionId,
}: MobileNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { openSidebar } = useUI();
  const router = useRouter();
  const totalItems = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-20 border-b border-gray-200 text-gray-700">
      <div className="relative flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="menu-button"
          className="flex items-center justify-center w-6 h-6"
        >
          <MenuIcon className="w-full h-full" />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo className="h-10 w-auto" />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="search-button"
            className="flex items-center justify-center"
          >
            <SearchIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => openSidebar({ view: "CART_SIDEBAR" })}
            aria-label="cart-button"
            className="relative flex items-center justify-center"
          >
            <CartIcon className="w-5 h-5 text-gray-600" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {totalItems}
              </span>
            )}
          </button>
          {/* ← Updated path here ↓ */}
          <button
            onClick={() =>
              router.push(isAuthenticated ? "/account" : "/account/login")
            }
            aria-label="account-button"
            className="flex items-center justify-center w-6 h-6"
          >
            <UserIcon className="w-full h-full text-gray-600" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <SearchOverlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          regionId={regionId}
        />
      )}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
