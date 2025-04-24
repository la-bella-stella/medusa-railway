// src/modules/layout/components/cart-sidebar/index.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { convertToLocale } from "@lib/util/money";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import CartItem from "@modules/cart/components/item";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

interface CartSidebarProps {
  cart: HttpTypes.StoreCart | null;
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cart, isOpen, onClose }) => {
  const { t } = useTranslation("common");
  // default items to an empty array if undefined
  const items = cart?.items ?? [];

  const isEmpty = items.length === 0;
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer>();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const prevCount = useRef<number>(totalItems);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const cartSubtotal = convertToLocale({
    amount: cart?.subtotal || 0,
    currency_code: cart?.currency_code || "USD",
  });

  const scheduleAutoClose = () => {
    onClose();
    const timer = setTimeout(onClose, 5000);
    setActiveTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer);
    };
  }, [activeTimer]);

  useEffect(() => {
    if (prevCount.current !== totalItems && !pathname.includes("/cart")) {
      scheduleAutoClose();
    }
    prevCount.current = totalItems;
  }, [totalItems, pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={sidebarRef} className="flex flex-col justify-between w-full h-full cart-drawer-main">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-5 md:px-7 py-4 border-b border-gray-100">
        <h2 className="text-xl md:text-2xl font-bold text-heading m-0">
          {t("text-shopping-cart")}
        </h2>
        <button
          onClick={onClose}
          aria-label="close"
          className="px-4 text-2xl text-gray-500 hover:opacity-60 transition-opacity focus:outline-none"
        >
          <IoClose className="text-black" />
        </button>
      </div>

      {/* Items */}
      {!isEmpty ? (
        <div className="flex-grow overflow-y-scroll max-h-[402px] no-scrollbar w-full">
          <div className="px-5 md:px-7 w-full">
            <table className="w-full border-collapse">
              <tbody>
                {items
                  .sort((a, b) => (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1)
                  .map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code || "USD"}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center px-5 pt-8 pb-5 md:px-7 transition-opacity duration-200 ease-in-out"
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
      <div className="px-5 pt-2 pb-5 md:px-7 md:pb-7 flex flex-col">
        {!isEmpty && (
          <div className="flex items-center justify-between mb-4 text-small-regular">
            <span className="font-semibold text-ui-fg-base">
              Subtotal <span className="font-normal">(excl. taxes)</span>
            </span>
            <span
              className="text-large-semi"
              data-testid="cart-subtotal"
              data-value={cart?.subtotal}
            >
              {cartSubtotal}
            </span>
          </div>
        )}
        <LocalizedClientLink
          href={isEmpty ? "/" : "/checkout"}
          passHref
          className={classNames(
            "w-full px-5 py-3 flex items-center justify-center bg-heading rounded-md text-sm sm:text-base text-white transition hover:bg-gray-600 focus:outline-none",
            {
              "cursor-not-allowed bg-gray-400 hover:bg-gray-400": isEmpty,
            }
          )}
        >
          <span className="w-full ltr:pr-5 rtl:pl-5 py-0.5 -mt-0.5">
            {t("text-proceed-to-checkout")}
          </span>
          <span className="flex-shrink-0 ltr:ml-auto rtl:mr-auto py-0.5 -mt-0.5 rtl:flex">
            <span className="border-white ltr:border-l rtl:border-r ltr:pr-5 rtl:pl-5 py-0.5" />
            {cartSubtotal}
          </span>
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default CartSidebar;
