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
import { useUI } from "@lib/context/ui-context";

interface CartSidebarProps {
  cart: HttpTypes.StoreCart | null;
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cart, isOpen, onClose }) => {
  const { t } = useTranslation("common");
  const { openSidebar, closeSidebar } = useUI();
  const [isLoading, setIsLoading] = useState(false);
  const isEmpty = !cart?.items || cart.items.length === 0;
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(undefined);
  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const itemRef = useRef<number>(totalItems || 0);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const cartSubtotal = convertToLocale({
    amount: cart?.subtotal || 0,
    currency_code: cart?.currency_code?.toUpperCase() || "USD", // Normalize to USD
  });

  const timedOpen = () => {
    console.log("Timed open triggered");
    if (isLoading) return; // Prevent closing while loading
    const timer = setTimeout(() => {
      onClose();
      closeSidebar(); // Close sidebar via useUI
    }, 10000); // Increased to 10 seconds for slower connections
    setActiveTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
      }
    };
  }, [activeTimer]);

  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      setIsLoading(true);
      openSidebar({ view: "CART_SIDEBAR" }); // Open sidebar
      setTimeout(() => {
        setIsLoading(false);
        if (!isEmpty) {
          timedOpen(); // Only start timer if cart is not empty
        }
      }, 1500); // Increased delay to 1.5 seconds for cart data
    }
    itemRef.current = totalItems;
  }, [totalItems, pathname, openSidebar, isEmpty]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
        closeSidebar(); // Close sidebar via useUI
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, closeSidebar]);

  return (
    <div
      className={`flex flex-col justify-between w-full h-full cart-drawer-main transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      ref={sidebarRef}
    >
      <div className="w-full flex justify-between items-center relative px-5 md:px-7 py-4 border-b border-gray-100">
        <h2 className="m-0 text-xl font-bold md:text-2xl text-heading">
          {t("text-shopping-cart")}
        </h2>
        <button
          className="flex items-center justify-center px-4 text-2xl text-gray-500 transition-opacity focus:outline-none hover:opacity-60"
          onClick={() => {
            onClose();
            closeSidebar(); // Close sidebar via useUI
          }}
          aria-label="close"
        >
          <IoClose className="text-black" />
        </button>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center px-5 pt-8 pb-5 md:px-7">
          <p className="text-lg text-gray-500">{t("text-loading")}</p>
        </div>
      ) : !isEmpty ? (
        <div className="flex-grow w-full overflow-y-scroll max-h-[402px] no-scrollbar px-5 md:px-7">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("text-product")}</Table.HeaderCell>
                <Table.HeaderCell>{t("text-quantity")}</Table.HeaderCell>
                <Table.HeaderCell>{t("text-price")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {cart?.items
                ?.sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1;
                })
                .map((item) => (
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

      <div className="flex flex-col px-5 pt-2 pb-5 md:px-7 md:pb-7">
        {!isEmpty && (
          <div className="flex items-center justify-between text-small-regular mb-4">
            <span className="text-ui-fg-base font-semibold">
              Subtotal <span className="font-normal">(excl. taxes)</span>
            </span>
            <span className="text-large-semi" data-testid="cart-subtotal" data-value={cart?.subtotal}>
              {cartSubtotal}
            </span>
          </div>
        )}
        <LocalizedClientLink
          href={isEmpty ? "/" : "/checkout"}
          passHref
          className={classNames(
            "w-full px-5 py-3 flex items-center justify-center bg-heading rounded-md text-sm sm:text-base text-white focus:outline-none transition duration-300 hover:bg-gray-600",
            {
              "cursor-not-allowed bg-gray-400 hover:bg-gray-400": isEmpty,
            }
          )}
        >
          <span className="w-full ltr:pr-5 rtl:pl-5 -mt-0.5 py-0.5">
            {t("text-proceed-to-checkout")}
          </span>
          <span className="ltr:ml-auto rtl:mr-auto flex-shrink-0 -mt-0.5 py-0.5 rtl:flex">
            <span className="ltr:border-l rtl:border-r border-white ltr:pr-5 rtl:pl-5 py-0.5" />
            {cartSubtotal}
          </span>
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default CartSidebar;