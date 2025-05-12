// src/modules/layout/components/mega-menu/index.tsx
import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface MenuItem {
  id: number | string;
  path: string;
  label: string;
  columnItemItems?: MenuItem[];
}

interface MegaMenuProps {
  columns: {
    id: number | string;
    columnItems: MenuItem[];
  }[];
  image?: string;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ columns, image }) => {
  const { t, ready } = useTranslation("menu");

  if (!ready) return <div>Loading translations...</div>;

  return (
    <div className="w-[calc(100vw-2rem)] max-w-[1400px] bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col xl:flex-row p-6 gap-6">
        <div
          className={`flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 ${
            image ? "xl:w-[70%]" : "w-full"
          }`}
        >
          {columns.map((column) => (
            <ul key={column.id} className="py-4">
              {column.columnItems.map((ci) => (
                <li key={ci.id} className="mb-2">
                  <LocalizedClientLink
                    href={ci.path}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-800 rounded-md hover:bg-gray-100 transition-colors duration-200 uppercase tracking-wider"
                  >
                    {t(ci.label?.trim() || "Unknown")} {/* Handle undefined label */}
                  </LocalizedClientLink>
                  {ci.columnItemItems?.length ? (
                    <ul className="mt-2 ml-6 space-y-1">
                      {ci.columnItemItems.map((sub) => (
                        <li key={sub.id}>
                          <LocalizedClientLink
                            href={sub.path}
                            className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200 uppercase tracking-wider"
                          >
                            {t(sub.label?.trim() || "Unknown")} {/* Handle undefined label */}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ))}
        </div>

        {image && (
          <div className="w-full xl:w-[30%] min-w-[280px] shrink-0">
            <div className="relative rounded-lg overflow-hidden aspect-[4/3] xl:aspect-[3/4]">
              <Image
                src={image}
                alt={t("menu-image")}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 1280px) 100vw, 30vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;