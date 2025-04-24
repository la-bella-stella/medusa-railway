// src/modules/layout/components/ClientNav.tsx
"use client";

import React, { useCallback, useState, useRef } from "react";
import { StoreRegion, HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import LanguageSwitcher from "@modules/common/components/language-switcher";
import CartIcon from "@modules/common/icons/cart-icon";
import CartSidebar from "@modules/layout/components/cart-sidebar";
import { useTranslation } from "react-i18next";
import { useWindowSize } from "react-use";
import { useAtom } from "jotai";
import classNames from "classnames";
import Alert from "@modules/common/components/alert";
import CountdownTimer from "@modules/common/components/countdown-timer";
import Logo from "@modules/common/components/logo";
import SearchIcon from "@modules/common/icons/search-icon";
import MenuIcon from "@modules/common/icons/menu-icon";
import UserIcon from "@modules/common/icons/user";
import { useRouter } from "next/navigation";
import {
  RESPONSIVE_WIDTH,
  checkIsMaintenanceModeComing,
  checkIsMaintenanceModeStart,
  checkIsScrollingStart,
  checkIsShopMaintenanceModeComing,
  checkIsShopMaintenanceModeStart,
} from "@lib/config/constants";
import { useActiveScroll } from "@lib/util/add-active-scroll";
import { menu } from "@lib/data/menus";
import HeaderMenu from "@modules/layout/components/header-menu";
import MobileMenu from "@modules/layout/components/mobile-menu";

interface ClientNavProps {
  regions: StoreRegion[];
  isAuthenticated: boolean;
  cart: HttpTypes.StoreCart | null;
  regionId: string;
}

export default function ClientNav({
  regions,
  isAuthenticated,
  cart,
  regionId,
}: ClientNavProps) {
  const { t } = useTranslation("common");
  const { width } = useWindowSize();
  const siteHeaderRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // sticky + maintenance
  useActiveScroll(siteHeaderRef, 0);
  const [underComing] = useAtom(checkIsMaintenanceModeComing);
  const [shopComing] = useAtom(checkIsShopMaintenanceModeComing);
  const [underStart, setUnderStart] = useAtom(checkIsMaintenanceModeStart);
  const [shopStart, setShopStart] = useAtom(checkIsShopMaintenanceModeStart);
  const [isScrolling] = useAtom(checkIsScrollingStart);

  const maintenanceDate = new Date("2025-07-11T05:00:00");
  const showAlert =
    (width >= RESPONSIVE_WIDTH && underComing && !isScrolling && !shopComing) ||
    (width >= RESPONSIVE_WIDTH && shopComing && !isScrolling && !underComing);

  // mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);
  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  // countdown completions
  const onUnderComplete = useCallback(() => setUnderStart(true), [setUnderStart]);
  const onShopComplete = useCallback(() => setShopStart(true), [setShopStart]);

  // cart item count
  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  try {
    return (
      <>
        <header
          id="siteHeader"
          ref={siteHeaderRef}
          className={classNames("w-full relative z-20 bg-white", {
            "lg:h-24": !showAlert,
            "lg:h-28 lg:pb-4": showAlert,
          })}
        >
          {showAlert && (
            <Alert
              message={`Site ${t("text-maintenance-mode-title")}`}
              variant="info"
              className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200"
              childClassName="flex justify-center items-center w-full gap-4 text-sm font-semibold text-gray-700 py-2"
            >
              <CountdownTimer
                date={maintenanceDate}
                className="text-gray-700 [&>p]:bg-gray-100 [&>p]:p-1 [&>p]:text-xs [&>p]:rounded"
                onComplete={onUnderComplete}
              />
            </Alert>
          )}

          <div className="innerSticky fixed top-0 left-0 w-full z-30 bg-white transition duration-200 ease-in-out text-gray-700 pt-2">
            {/* TOP ROW */}
            <div className="content-container relative max-w-[1920px] px-4 lg:px-6 flex items-center justify-between h-14">
              <button
                onClick={() => console.log("search")}
                aria-label="search-button"
                className="focus:outline-none"
              >
                <SearchIcon className="w-8 h-8 text-gray-600" />
              </button>

              {/* centered logo with click handler */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Logo className="h-12 w-auto" />
              </div>

              <div className="flex items-center space-x-6">
                <LanguageSwitcher />

                <LocalizedClientLink
                  href={isAuthenticated ? "/account" : "/login"}
                  className="focus:outline-none"
                >
                  <UserIcon className="w-8 h-8 text-gray-600" />
                </LocalizedClientLink>

                <button
                  onClick={openCart}
                  aria-label="cart-button"
                  className="relative focus:outline-none"
                >
                  <CartIcon className="w-8 h-8 text-gray-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* MEGA-MENU ROW (desktop) */}
            <div className="content-container max-w-[1920px] px-4 lg:px-6 hidden lg:flex lg:flex-col">
              <div className="flex justify-center mt-1">
                <HeaderMenu data={menu} />
              </div>
            </div>

            {/* MOBILE ROW */}
            <div className="lg:hidden relative flex items-center justify-between h-16 sm:h-20 bg-white border-b border-gray-200 text-gray-700">
              <button
                onClick={handleMobileOpen}
                aria-label="menu"
                className="ml-4 focus:outline-none"
              >
                <MenuIcon className="w-8 h-8" />
              </button>

              {/* centered logo with click */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Logo className="h-12 w-auto" />
              </div>

              <div className="flex items-center mr-4 space-x-4">
                <button
                  onClick={() => console.log("search")}
                  aria-label="search-button"
                  className="focus:outline-none"
                >
                  <SearchIcon className="w-8 h-8 text-gray-600" />
                </button>

                <button
                  onClick={openCart}
                  aria-label="cart-button"
                  className="relative focus:outline-none"
                >
                  <CartIcon className="w-8 h-8 text-gray-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </button>

                <LocalizedClientLink
                  href={isAuthenticated ? "/account" : "/login"}
                  className="focus:outline-none"
                >
                  <UserIcon className="w-8 h-8 text-gray-600" />
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </header>

        {/* CART OVERLAY & SIDEBAR */}
        {isCartOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
              onClick={closeCart}
            />
            <div
              className="fixed top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50 transition-transform duration-200 ease-in-out"
              style={{
                transform: isCartOpen
                  ? "translateX(0)"
                  : "translateX(100%)",
              }}
            >
              <CartSidebar
                cart={cart}
                isOpen={isCartOpen}
                onClose={closeCart}
              />
            </div>
          </>
        )}

        <MobileMenu isOpen={mobileOpen} onClose={handleMobileClose} />
      </>
    );
  } catch (error) {
    console.error("ClientNav rendering error:", error);
    return (
      <div className="text-center py-4">
        Error loading navigation. Please refresh the page.
      </div>
    );
  }
}
