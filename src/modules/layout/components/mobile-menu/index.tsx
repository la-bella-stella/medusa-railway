// src/modules/layout/components/mobile-menu/index.tsx
"use client";

import React, { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import Scrollbar from "@modules/layout/components/scrollbar";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Logo from "@modules/common/components/logo";
import { mobileMenu as rawMenu } from "@lib/data/menus";
import { useTranslation } from "react-i18next";

interface MenuItem {
  id: number;
  path: string;
  label: string;
  subMenu?: MenuItem[];
}

const mobileMenu = rawMenu as MenuItem[];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);
  const { t } = useTranslation("menu");

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderMenu = (items: MenuItem[], depth = 0, parentKey = "") => (
    <ul className={depth === 0 ? "mobileMenu" : "pt-1"}>
      {items.map((item, i) => {
        const key = `${parentKey}${item.id}-${i}`;
        const hasChildren = !!item.subMenu?.length;
        const padding = depth === 0 ? "pl-0" : "pl-6";

        return (
          <li key={key} className={`mb-1 ${padding}`}>
            <div className="flex items-center justify-between">
              <LocalizedClientLink
                href={item.path}
                className="w-full text-[15px] menu-item py-2 transition duration-300 ease-in-out"
                onClick={onClose}
              >
                {/* add dash for sub-items */}
                <span>
                  {depth > 0 ? "– " : ""}
                  {t(item.label)}
                </span>
              </LocalizedClientLink>

              {hasChildren && (
                <button
                  onClick={() => toggleSubMenu(key)}
                  aria-label="Toggle submenu"
                  className="p-2 focus:outline-none"
                >
                  <IoIosArrowDown
                    className={`transform transition-transform ${
                      openSubMenus.includes(key) ? "-rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              )}
            </div>

            {hasChildren && openSubMenus.includes(key) && (
              renderMenu(item.subMenu!, depth + 1, `${key}-`)
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <Transition show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-50 flex">
        {/* backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={onClose}
          />
        </Transition.Child>

        {/* drawer */}
        <Transition.Child
          as="aside"
          enter="transform transition duration-300 ease-in-out"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition duration-200 ease-in-out"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
          className="relative bg-white w-3/4 max-w-md h-full shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Logo />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="text-2xl text-gray-500 hover:opacity-60 focus:outline-none"
            >
              <IoClose />
            </button>
          </div>

          {/* menu body */}
          <Scrollbar className="flex-grow overflow-y-auto">
            <nav className="py-6 px-4 text-heading">
              {renderMenu(mobileMenu)}
            </nav>
          </Scrollbar>
        </Transition.Child>
      </div>
    </Transition>
  );
}
