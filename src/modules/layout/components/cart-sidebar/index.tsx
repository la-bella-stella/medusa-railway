"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import { convertToLocale } from "@lib/util/money";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { OverlayScrollbars } from "overlayscrollbars";
import type { OverlayScrollbars as OverlayScrollbarsInstance } from "overlayscrollbars";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useUI } from "@lib/context/ui-context";

const CartItem = dynamic(() => import("@modules/cart/components/item"), {
  ssr: false,
});

interface CartSidebarProps {
  cart: HttpTypes.StoreCart | null;
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("common");
  const { openSidebar, closeSidebar } = useUI();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<NodeJS.Timeout>();
  const osInstance = useRef<OverlayScrollbarsInstance | null>(null);

  const totalItems = useMemo(
    () => cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
    [cart?.items]
  );

  const sortedItems = useMemo(() => {
    return [...(cart?.items || [])].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
  }, [cart?.items]);

  const isEmpty = sortedItems.length === 0;

  const cartSubtotal = convertToLocale({
    amount: cart?.subtotal || 0,
    currency_code: cart?.currency_code?.toUpperCase() || "USD",
  });

  const startCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      onClose();
      closeSidebar();
    }, 5000);
  };

  useEffect(() => {
    if (!isOpen && totalItems > 0 && !pathname.includes("/cart")) {
      openSidebar({ view: "CART_SIDEBAR" });
      startCloseTimer();
    }
  }, [isOpen, totalItems, pathname, openSidebar]);

  useEffect(() => {
    if (scrollRef.current && !osInstance.current) {
      osInstance.current = OverlayScrollbars(scrollRef.current, {
        scrollbars: {
          visibility: "hidden",
          autoHide: "leave",
        },
      });
    }

    return () => {
      if (osInstance.current) {
        osInstance.current.destroy();
        osInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [isOpen, onClose, closeSidebar]);

  return (
    <div
      ref={sidebarRef}
      className={classNames(
        "flex flex-col justify-between w-full h-full cart-drawer-main transition-transform duration-300 shadow-lg rounded-l-lg",
        {
          "translate-x-0": isOpen,
          "translate-x-full": !isOpen,
        }
      )}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center relative ltr:pl-5 rtl:pr-5 ltr:md:pl-7 rtl:md:pr-7 py-0.5 border-b border-gray-100">
        <h2 className="m-0 text-xl font-bold md:text-2xl text-heading">
          {t("text-shopping-cart")}
        </h2>
        <button
          aria-label="close"
          className="flex items-center justify-center px-4 py-6 text-2xl text-gray-500 transition-opacity md:px-6 lg:py-8 focus:outline-none hover:opacity-60"
          onClick={() => {
            onClose();
            closeSidebar();
          }}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="text-black mt-1 md:mt-0.5"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
          </svg>
        </button>
      </div>

      {/* Body */}
      {!isEmpty ? (
        <div
          ref={scrollRef}
          className="os-theme-thin flex-grow w-full cart-scrollbar"
        >
          <div className="w-full px-5 md:px-7">
            {sortedItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                currencyCode={cart?.currency_code?.toUpperCase() || "USD"}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center px-5 md:px-7 pt-8 pb-5 transition-opacity duration-200 ease-in-out"
          style={{ opacity: isOpen ? 1 : 0 }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 mb-4"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h3 className="text-lg font-bold text-heading">
            {t("text-empty-cart")}
          </h3>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col px-5 pt-2 pb-5 md:px-7 md:pb-7">
        <a
          className={classNames(
            "w-full px-5 py-3 md:py-4 flex items-center justify-center bg-black rounded-md text-sm sm:text-base text-white focus:outline-none transition duration-300 hover:bg-gray-600",
            {
              "cursor-not-allowed bg-gray-400 hover:bg-gray-400": isEmpty,
            }
          )}
          href={isEmpty ? "/" : "/checkout"}
        >
          <span className="w-full ltr:pr-5 rtl:pl-5 -mt-0.5 py-0.5">
            {t("text-proceed-to-checkout")}
          </span>
          {!isEmpty && (
            <span className="ltr:ml-auto rtl:mr-auto flex-shrink-0 -mt-0.5 py-0.5 rtl:flex">
              <span className="ltr:border-l rtl:border-r border-white ltr:pr-5 rtl:pl-5 py-0.5"></span>
              {cartSubtotal}
            </span>
          )}
        </a>
      </div>
    </div>
  );
};

export default React.memo(CartSidebar);