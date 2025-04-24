// src/modules/common/components/language-switcher/index.tsx
"use client";

import { useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import ChevronDown from "@modules/common/icons/chevron-down";
import { languageMenu, LanguageMenuItem } from "@lib/locals";
import Cookies from "js-cookie";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { countryCode } = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // only include supported locales
  const locales = ["en", "ar"];
  const filterItem: LanguageMenuItem[] = languageMenu.filter((el) =>
    locales.includes(el.id)
  );

  const currentSelectedItem: LanguageMenuItem = countryCode
    ? filterItem.find((o) => o.value === countryCode)!
    : filterItem[0];
  const [selectedItem, setSelectedItem] = useState<LanguageMenuItem>(
    currentSelectedItem
  );

  function handleItemClick(values: LanguageMenuItem) {
    Cookies.set("NEXT_LOCALE", values.value, { expires: 365 });
    setSelectedItem(values);
    const queryString = searchParams.toString();
    const newPath = `/${values.value}${pathname}${
      queryString ? `?${queryString}` : ""
    }`;
    router.push(newPath);
  }

  return (
    <Listbox value={selectedItem} onChange={handleItemClick}>
      {({ open }) => (
        <div className="relative inline-block">
          <Listbox.Button className="inline-flex items-center space-x-1 text-base font-semibold text-gray-900 hover:text-gray-700 focus:outline-none">
            <span>{t(selectedItem.name)}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 mt-1 w-32 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {filterItem.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-4 ${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {t(option.name)}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
