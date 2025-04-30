"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { convertToLocale } from "@lib/util/money";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Table } from "@medusajs/ui";
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
  const closeTimer = useRef<NodeJS.Timeout>();

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

  // ⬇️ only open when sidebar is closed AND we have items
  useEffect(() => {
    if (!isOpen && totalItems > 0 && !pathname.includes("/cart")) {
      openSidebar({ view: "CART_SIDEBAR" });
      startCloseTimer();
    }
  }, [isOpen, totalItems, pathname, openSidebar]);

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
        "flex flex-col justify-between w-full h-full cart-drawer-main transition-transform duration-300",
        {
          "translate-x-0": isOpen,
          "translate-x-full": !isOpen,
        }
      )}
    >
      {/* Header */}
      <div className="flex w-full justify-between items-center px-5 md:px-7 py-4 border-b border-gray-100 relative">
        <h2 className="m-0 text-xl font-bold md:text-2xl text-heading">
          {t("text-shopping-cart")}
        </h2>
        <button
          aria-label="close"
          className="flex items-center justify-center px-4 text-2xl text-gray-500 hover:opacity-60 focus:outline-none transition-opacity"
          onClick={() => {
            onClose();
            closeSidebar();
          }}
        >
          <IoClose className="text-black" />
        </button>
      </div>

      {/* Body */}
      {!isEmpty ? (
        <div className="flex-grow w-full overflow-y-auto max-h-[402px] no-scrollbar px-5 md:px-7">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("text-product")}</Table.HeaderCell>
                <Table.HeaderCell>{t("text-quantity")}</Table.HeaderCell>
                <Table.HeaderCell>{t("text-price")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  currencyCode={cart?.currency_code?.toUpperCase() || "USD"}
                />
              ))}
            </Table.Body>
          </Table>
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
      <div className="flex flex-col px-5 md:px-7 pt-2 pb-5 md:pb-7">
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
            "w-full flex items-center justify-center px-5 py-3 text-white bg-heading rounded-md text-sm sm:text-base transition duration-300 hover:bg-gray-600 focus:outline-none",
            {
              "cursor-not-allowed bg-gray-400 hover:bg-gray-400": isEmpty,
            }
          )}
        >
          <span className="py-0.5 -mt-0.5 w-full ltr:pr-5 rtl:pl-5">
            {t("text-proceed-to-checkout")}
          </span>
          {!isEmpty && (
            <span className="flex-shrink-0 rtl:flex ltr:ml-auto rtl:mr-auto py-0.5 -mt-0.5 ltr:pl-5 rtl:pr-5 border-white ltr:border-l rtl:border-r">
              {cartSubtotal}
            </span>
          )}
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default React.memo(CartSidebar);
