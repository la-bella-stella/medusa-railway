"use client";

import React, { useCallback, useState } from "react";
import { StoreRegion, HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
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

type DivElementRef = React.MutableRefObject<HTMLDivElement>;

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
  const siteHeaderRef = React.useRef() as DivElementRef;
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  useActiveScroll(siteHeaderRef, 0);

  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  const [shopUnderMaintenanceIsComing] = useAtom(checkIsShopMaintenanceModeComing);
  const [underMaintenanceStart, setUnderMaintenanceStart] = useAtom(checkIsMaintenanceModeStart);
  const [shopUnderMaintenanceStart, setShopUnderMaintenanceStart] = useAtom(checkIsMaintenanceModeStart);
  const [isScrolling] = useAtom(checkIsScrollingStart);

  const settings = {
    maintenance: { start: new Date("2025-07-11T05:00:00") },
  };

  const isAlertMessage =
    (width >= RESPONSIVE_WIDTH &&
      underMaintenanceIsComing &&
      !isScrolling &&
      !shopUnderMaintenanceIsComing) ||
    (width >= RESPONSIVE_WIDTH &&
      !underMaintenanceIsComing &&
      !isScrolling &&
      shopUnderMaintenanceIsComing);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMaintenanceComplete = useCallback(() => {
    setUnderMaintenanceStart(true);
  }, [setUnderMaintenanceStart]);

  const handleShopMaintenanceComplete = useCallback(() => {
    setShopUnderMaintenanceStart(true);
  }, [setShopUnderMaintenanceStart]);

  const totalItems =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  try {
    return (
      <>
        <header
          id="siteHeader"
          ref={siteHeaderRef}
          className={classNames("w-full relative z-20 bg-white", {
            "lg:h-24": !isAlertMessage,
            "lg:h-28 lg:pb-4": isAlertMessage,
          })}
        >
          {width >= RESPONSIVE_WIDTH &&
            underMaintenanceIsComing &&
            !isScrolling &&
            !shopUnderMaintenanceIsComing && (
              <Alert
                message={`Site ${t("text-maintenance-mode-title")}`}
                variant="info"
                className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200"
                childClassName="flex justify-center font-semibold items-center w-full gap-4 text-gray-700 py-2"
              >
                <CountdownTimer
                  date={settings?.maintenance?.start}
                  className="text-gray-700 [&>p]:bg-gray-100 [&>p]:p-1 [&>p]:text-xs [&>p]:rounded"
                  onComplete={handleMaintenanceComplete}
                />
              </Alert>
            )}

          <div className="innerSticky fixed top-0 left-0 w-full z-30 bg-white transition duration-200 ease-in-out text-gray-700">
            <div className="mx-auto max-w-[1920px] px-4 lg:px-6">
              {/* Desktop View */}
              <div className="hidden lg:flex lg:flex-col">
                {/* Top Row: Search, Logo, Cart/User */}
                <div
                  className={classNames(
                    "flex items-center justify-between h-14 flex-wrap-nowrap min-w-0",
                    {
                      "lg:mt-6": isAlertMessage,
                    }
                  )}
                >
                  <div className="flex items-center space-x-4 flex-shrink-0 ml-1">
                    <button
                      className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none transform transition-colors"
                      onClick={() => console.log("Open search")}
                      aria-label="search-button"
                    >
                      <SearchIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <Logo className="absolute left-1/2 -translate-x-1/2 max-w-[150px]" />

                  <div className="flex items-center space-x-1 flex-shrink-0 mr-1">
                    <button
                      className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none transform transition-colors"
                      onClick={openCart}
                      aria-label="cart-button"
                    >
                      <CartIcon className="w-5 h-5 text-gray-600" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {totalItems}
                        </span>
                      )}
                    </button>
                    <LocalizedClientLink
                      className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none transform transition-colors"
                      href={isAuthenticated ? "/account" : "/login"}
                      data-testid="nav-account-link"
                    >
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </LocalizedClientLink>
                  </div>
                </div>

                {/* Bottom Row: Menu Items */}
                <div className="flex justify-center mt-1">
                  <HeaderMenu
                    data={menu}
                    className="flex items-center space-x-6 text-sm uppercase tracking-wider text-gray-600"
                  />
                </div>
              </div>

              {/* Mobile View */}
              <div className="relative flex items-center justify-between h-16 sm:h-20 px-4 bg-white border-b border-gray-200 text-gray-700 lg:hidden">
                <div className="flex items-center gap-4">
                  <button
                    aria-label="Menu"
                    className="flex items-center justify-center"
                    onClick={handleMobileMenu}
                  >
                    <MenuIcon />
                  </button>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Logo className="max-w-[150px]" />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    className="flex items-center justify-center"
                    onClick={() => console.log("Open search")}
                    aria-label="search-button"
                  >
                    <SearchIcon />
                  </button>
                  <button
                    className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none transform transition-colors"
                    onClick={openCart}
                    aria-label="cart-button"
                  >
                    <CartIcon className="w-5 h-5 text-gray-600" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {totalItems}
                      </span>
                    )}
                  </button>
                  <LocalizedClientLink
                    className="flex items-center justify-center"
                    href={isAuthenticated ? "/account" : "/login"}
                    data-testid="nav-account-link"
                  >
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Blurred Overlay and Sidebar */}
        {isCartOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-200 ease-in-out"
              style={{ opacity: isCartOpen ? 1 : 0 }}
              onClick={closeCart}
            />
            <div
              className="cart-sidebar fixed top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50 transition-transform duration-200 ease-in-out"
              style={{ transform: isCartOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <CartSidebar cart={cart} isOpen={isCartOpen} onClose={closeCart} />
            </div>
          </>
        )}

        <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />
      </>
    );
  } catch (error) {
    console.error("ClientNav: Error rendering:", error);
    return <div>Error loading navigation. Please refresh the page.</div>;
  }
}