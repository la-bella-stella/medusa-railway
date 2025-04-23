// src/modules/layout/components/header-menu/index.tsx
import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface MenuProps {
  data: any;
  className?: string;
}

const HeaderMenu: React.FC<MenuProps> = ({ data, className }) => {
  const { t } = useTranslation("menu");

  return (
    <nav
      className={classNames(
        "headerMenu flex justify-center w-full relative lg:py-2",
        className
      )}
    >
      <div className="flex items-center max-w-[1920px] mx-auto">
        {data?.map((item: any, index: number) => (
          <div
            className="menuItem group cursor-pointer px-3 lg:px-4"
            key={item.id}
          >
            <LocalizedClientLink
              href={item.path}
              className={classNames(
                "relative inline-flex items-center py-2 text-sm font-normal uppercase tracking-wider text-gray-700 transition-colors",
                {
                  "text-red-500 hover:text-red-600": index === data.length - 1,
                  "hover:text-gray-900": index !== data.length - 1,
                }
              )}
            >
              {t(item.label)}
              <span
                className={classNames(
                  "absolute w-0 bg-gray-900 h-[1px] bottom-0 left-0 transition-all duration-300 ease-in-out"
                )}
              />
            </LocalizedClientLink>

            {item?.columns && Array.isArray(item.columns) && (
              <div
                className={classNames(
                  "absolute bg-white invisible subMenu shadow-lg border border-gray-100 ltr:left-0 rtl:right-0 group-hover:visible transition-all duration-400 ease-in-out w-[220px] lg:w-[240px] top-[calc(100%_+_25px)] group-hover:top-full z-50"
                )}
              >
                <div className="py-4 text-sm text-gray-600 flex">
                  {item.columns.map((column: any) => (
                    <ul key={column.id} className="px-4">
                      {column.columnItems.map((menu: any) => (
                        <li key={menu.id} className="py-1">
                          <LocalizedClientLink href={menu.path}>
                            {t(menu.label)}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  ))}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-auto h-auto"
                      style={{ maxWidth: item.size }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default HeaderMenu;