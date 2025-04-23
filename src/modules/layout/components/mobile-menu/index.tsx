// src/modules/layout/components/mobile-menu/index.tsx
"use client";
import React, { useState } from "react";
import Scrollbar from "@modules/layout/components/scrollbar"; // Update import path
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Logo from "@modules/common/components/logo";
import { mobileMenu } from "@lib/data/menus";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [activeMenus, setActiveMenus] = useState<string[]>([]);
  const { t } = useTranslation("menu");

  const handleArrowClick = (menuName: string) => {
    let newActiveMenus = [...activeMenus];
    if (newActiveMenus.includes(menuName)) {
      let index = newActiveMenus.indexOf(menuName);
      if (index > -1) {
        newActiveMenus.splice(index, 1);
      }
    } else {
      newActiveMenus.push(menuName);
    }
    setActiveMenus(newActiveMenus);
  };

  const ListMenu = ({
    dept,
    data,
    hasSubMenu,
    menuName,
    menuIndex,
    className = "",
  }: any) =>
    data.label && (
      <li className={`mb-0.5 ${className}`}>
        <div className="flex items-center justify-between">
          <LocalizedClientLink
            href={data.path}
            className="w-full text-[15px] menu-item relative py-3 ltr:pl-5 ltr:md:pl-7 rtl:pr-5 rtl:md:pr-7 ltr:pr-4 rtl:pl-4 transition duration-300 ease-in-out"
          >
            <span className="block w-full" onClick={onClose}>
              {t(`${data.label}`)}
            </span>
          </LocalizedClientLink>
          {hasSubMenu && (
            <div
              className="cursor-pointer w-16 md:w-20 h-8 text-lg flex-shrink-0 flex items-center justify-center"
              onClick={() => handleArrowClick(menuName)}
            >
              <IoIosArrowDown
                className={`transition duration-200 ease-in-out transform text-heading ${
                  activeMenus.includes(menuName) ? "-rotate-180" : "rotate-0"
                }`}
              />
            </div>
          )}
        </div>
        {hasSubMenu && (
          <SubMenu
            dept={dept}
            data={data.subMenu}
            toggle={activeMenus.includes(menuName)}
            menuIndex={menuIndex}
          />
        )}
      </li>
    );

  const SubMenu = ({ dept, data, toggle, menuIndex }: any) => {
    if (!toggle) {
      return null;
    }

    dept = dept + 1;

    return (
      <ul className="pt-0.5">
        {data?.map((menu: any, index: number) => {
          const menuName: string = `sidebar-submenu-${dept}-${menuIndex}-${index}`;
          return (
            <ListMenu
              dept={dept}
              data={menu}
              hasSubMenu={menu.subMenu}
              menuName={menuName}
              key={menuName}
              menuIndex={index}
              className={dept > 1 && "ltr:pl-4 rtl:pr-4"}
            />
          );
        })}
      </ul>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex flex-col justify-between w-full h-full">
        <div className="w-full border-b border-gray-100 flex justify-between items-center relative ltr:pl-5 ltr:md:pl-7 rtl:pr-5 rtl:md:pr-7 flex-shrink-0 py-0.5">
          <Logo />
          <button
            className="flex text-2xl items-center justify-center text-gray-500 px-4 md:px-5 py-6 lg:py-8 focus:outline-none transition-opacity hover:opacity-60"
            onClick={onClose}
            aria-label="close"
          >
            <IoClose className="text-black mt-1 md:mt-0.5" />
          </button>
        </div>

        <Scrollbar className="menu-scrollbar flex-grow mb-auto">
          <div className="flex flex-col py-7 px-0 lg:px-2 text-heading">
            <ul className="mobileMenu">
              {mobileMenu?.map((menu: any, index: number) => {
                const dept: number = 1;
                const menuName: string = `sidebar-menu-${dept}-${index}`;
                return (
                  <ListMenu
                    dept={dept}
                    data={menu}
                    hasSubMenu={menu.subMenu}
                    menuName={menuName}
                    key={menuName}
                    menuIndex={index}
                  />
                );
              })}
            </ul>
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}