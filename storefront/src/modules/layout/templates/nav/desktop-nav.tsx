"use client";

import React, { useCallback, useState } from "react";
import { StoreRegion, HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import LanguageSwitcher from "@modules/common/components/language-switcher";
import SearchIcon from "@modules/common/icons/search-icon";
import Logo from "@modules/common/components/logo";
import UserIcon from "@modules/common/icons/user";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import HeaderMenu from "@modules/layout/components/header-menu";
import Alert from "@modules/common/components/alert";
import CountdownTimer from "@modules/common/components/countdown-timer";
import SearchModal from "@modules/search/templates/search-modal";
import CartDropdown from "@modules/layout/components/cart-dropdown";
import {
  RESPONSIVE_WIDTH,
  checkIsMaintenanceModeComing,
  checkIsShopMaintenanceModeComing,
  checkIsMaintenanceModeStart,
  checkIsShopMaintenanceModeStart,
  checkIsScrollingStart,
} from "@lib/config/constants";
import { useWindowSize } from "react-use";
import { useAtom } from "jotai";
import { menu } from "@lib/data/menus";

interface DesktopNavProps {
  regions: StoreRegion[];
  isAuthenticated: boolean;
  cart: HttpTypes.StoreCart | null;
  regionId: string;
}

export default function DesktopNav({
  regions,
  isAuthenticated,
  cart,
  regionId,
}: DesktopNavProps) {
  const { t } = useTranslation("common");
  const { width } = useWindowSize();
  const router = useRouter();

  const totalItems = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  // Maintenance alert atoms
  const [underComing] = useAtom(checkIsMaintenanceModeComing);
  const [shopComing] = useAtom(checkIsShopMaintenanceModeComing);
  const [underStart, setUnderStart] = useAtom(checkIsMaintenanceModeStart);
  const [shopStart, setShopStart] = useAtom(checkIsShopMaintenanceModeStart);
  const [isScrolling] = useAtom(checkIsScrollingStart);

  const maintenanceDate = new Date("2025-07-11T05:00:00");

  const showAlert =
    (width >= RESPONSIVE_WIDTH && underComing && !isScrolling && !shopComing) ||
    (width >= RESPONSIVE_WIDTH && shopComing && !isScrolling && !underComing);

  // When countdown completes
  const onUnderComplete = useCallback(() => setUnderStart(true), [setUnderStart]);
  const onShopComplete = useCallback(() => setShopStart(true), [setShopStart]);

  // Search modal control
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openSearch = () => {
    setIsSearchOpen(true);
  };
  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <div
      className={classNames(
        "w-full bg-white fixed top-0 left-0 z-20",
        { "lg:h-28 pb-4": showAlert, "lg:h-26": !showAlert }
      )}
    >
      {/* Maintenance alert */}
      {showAlert && (
        <Alert
          message={`Site ${t("text-maintenance-mode-title")}`}
          variant="info"
          className="fixed top-0 left-0 z-30 w-full bg-white border-b border-gray-200"
          childClassName="flex justify-center items-center w-full gap-4 text-sm font-semibold text-gray-700 py-2"
        >
          <CountdownTimer
            date={maintenanceDate}
            className="text-gray-700 [&>p]:bg-gray-100 [&>p]:p-1 [&>p]:text-xs [&>p]:rounded"
            onComplete={onUnderComplete}
          />
        </Alert>
      )}

      {/* Top row (desktop only) */}
      <div className="hidden lg:flex content-container px-4 lg:px-6 items-center justify-between h-14">
        {/* Search */}
        <button onClick={openSearch} aria-label="search-button">
          <SearchIcon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Logo */}
        <div
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo className="h-12 w-auto" />
        </div>

        {/* Language / Account / Cart */}
        <div className="flex items-center space-x-6">
          <LanguageSwitcher />

          <LocalizedClientLink
            href={isAuthenticated ? "/account" : "/account/login"}
            className="flex items-center justify-center w-6 h-6 focus:outline-none"
            aria-label="user-button"
          >
            <UserIcon className="w-full h-full text-gray-600" />
          </LocalizedClientLink>

          {/* Cart Dropdown */}
          <div className="flex items-center">
            <CartDropdown cart={cart} />
          </div>
        </div>
      </div>

      {/* Mega-menu */}
      <div className="hidden lg:flex flex-col content-container px-4 lg:px-6">
        <HeaderMenu data={menu} />
      </div>

      {/* Search Modal */}
      {isSearchOpen && <SearchModal onClose={closeSearch} />}
    </div>
  );
}