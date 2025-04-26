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
import { Table } from "@medusajs/ui";

interface CartSidebarProps {
  cart: HttpTypes.StoreCart | null;
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cart, isOpen, onClose }) => {
  const { t } = useTranslation("common");
  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout>();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const prevTotalRef = useRef<number>(totalItems);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const subtotal = convertToLocale({
    amount: cart?.subtotal || 0,
    currency_code: cart?.currency_code || "USD",
  });

  // Auto-close 5s after change when not on /cart
  useEffect(() => {
    if (prevTotalRef.current !== totalItems && !pathname.includes("/cart")) {
      onClose();
      const tmo = setTimeout(onClose, 5000);
      setAutoCloseTimer(tmo);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems, pathname, onClose]);

  // Clear on unmount
  useEffect(() => {
    return () => autoCloseTimer && clearTimeout(autoCloseTimer);
  }, [autoCloseTimer]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Prevent clicks inside the sidebar from propagating to the document
  const handleSidebarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={sidebarRef}
      onClick={handleSidebarClick}
      className="flex flex-col w-full h-full bg-white cart-drawer-main"
    >
      {/* HEADER */}
      <div className="px-5 md:px-7 pt-5 pb-3 border-b border-gray-200">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-wide">Your Cart</h2>
          <div className="flex items-center space-x-4">
            <LocalizedClientLink href="/cart" className="underline text-sm">
              View cart
            </LocalizedClientLink>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent propagation to the click-outside handler
                onClose();
              }}
              aria-label="Close cart"
              className="text-2xl text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <IoClose />
            </button>
          </div>
        </div>
        {/* Sub-row */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <LocalizedClientLink href="#" className="underline">
            Add order note
          </LocalizedClientLink>
          <div>
            Taxes and{" "}
            <LocalizedClientLink href="/shipping" className="underline">
              shipping
            </LocalizedClientLink>{" "}
            calculated at checkout.
          </div>
        </div>
      </div>

      {/* CHECKOUT BUTTON */}
      <div className="px-5 md:px-7 py-4 border-b border-gray-200">
        <LocalizedClientLink
          href={isEmpty ? "/" : "/checkout"}
          className={classNames(
            "w-full flex items-center justify-center py-3 text-center rounded-md text-white font-semibold transition",
            {
              "bg-black hover:bg-gray-800": !isEmpty,
              "bg-gray-400 cursor-not-allowed": isEmpty,
            }
          )}
        >
          <span className="mr-2">🛒</span>
          Checkout – {subtotal}
        </LocalizedClientLink>
      </div>

      {/* ITEMS LIST */}
      <div className="flex-grow overflow-y-auto no-scrollbar px-5 md:px-7 py-4">
        {isEmpty ? (
          <div className="text-center text-gray-500 py-20">
            {t("text-empty-cart")}
          </div>
        ) : (
          <Table>
            <Table.Body>
              {items
                .sort((a, b) =>
                  (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                )
                .map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code || "USD"}
                  />
                ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* OPTIONAL “You may also like” */}
      <div className="px-5 md:px-7 py-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold mb-2">You may also like…</h3>
        <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          Recommendations
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;