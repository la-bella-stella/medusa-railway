// src/modules/common/components/language-switcher/index.tsx
"use client";
import { useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation";
import ChevronDown from "@modules/common/icons/chevron-down";
import { languageMenu } from "@lib/locals";
import Cookies from "js-cookie";
import FlagEn from "@modules/common/icons/flags/flag-en";
import FlagAr from "@modules/common/icons/flags/flag-ar";

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  FlagEn: FlagEn,
  FlagAr: FlagAr,
};

// Import the type
import type { LanguageMenuItem } from "@lib/locals";

export default function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { countryCode } = useParams();
  const pathname = usePathname(); // Get the current path (e.g., "/products")
  const searchParams = useSearchParams(); // Get query params (e.g., "?id=123")

  const locales = ["en", "ar"];
  let filterItem = languageMenu?.filter((element) =>
    locales?.includes(element?.id)
  );

  const currentSelectedItem = countryCode
    ? filterItem?.find((o) => o?.value === countryCode)!
    : filterItem[0];
  const [selectedItem, setSelectedItem] = useState<LanguageMenuItem | undefined>(
    currentSelectedItem
  );

  function handleItemClick(values: LanguageMenuItem) {
    Cookies.set("NEXT_LOCALE", values?.value, { expires: 365 });
    setSelectedItem(values);

    // Construct the new path with the updated locale
    const queryString = searchParams.toString();
    const newPath = `/${values?.value}${pathname}${queryString ? `?${queryString}` : ""}`;
    router.push(newPath); // App Router: push the new path
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <Listbox value={selectedItem} onChange={handleItemClick}>
      {({ open }) => (
        <div className="ms-2 lg:ms-0 relative z-10 xl:w-[140px]">
          <Listbox.Button className="relative flex h-full w-full cursor-pointer items-center rounded text-[13px] font-semibold focus:outline-0 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 xl:h-auto xl:w-full xl:border xl:border-solid xl:border-[#CFD3DA] xl:bg-white xl:py-2 xl:text-sm xl:text-heading xl:ltr:pl-3 xl:ltr:pr-7 xl:rtl:pl-7 xl:rtl:pr-3">
            <span className="relative block h-[38px] w-[38px] overflow-hidden rounded-full xl:hidden">
              <span className="relative top-[3px] block">
                {selectedItem?.iconMobile ? renderIcon(selectedItem.iconMobile) : null}
              </span>
            </span>
            <span className="hidden items-center truncate xl:flex">
              <span className="text-xl ltr:mr-3 rtl:ml-3">
                {selectedItem?.icon ? renderIcon(selectedItem.icon) : null}
              </span>{" "}
              {t(selectedItem?.name || "")}
            </span>
            <span className="pointer-events-none absolute inset-y-0 hidden items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2 xl:flex">
              <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              static
              className={`absolute mt-1 max-h-60 w-[130px] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-0 ltr:right-0 rtl:left-0 xl:w-full`}
            >
              {filterItem?.map((option: LanguageMenuItem, index: number) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `${active ? "bg-gray-100 text-amber-900" : "text-gray-900"} relative cursor-pointer select-none py-2 px-3`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <span className="flex items-center">
                      <span className="text-xl">{option.icon ? renderIcon(option.icon) : null}</span>
                      <span
                        className={`${
                          selected ? "font-medium" : "font-normal"
                        } block truncate ltr:ml-1.5 rtl:mr-1.5`}
                      >
                        {t(option.name)}
                      </span>
                      {selected ? (
                        <span
                          className={`${active && "text-amber-600"} absolute inset-y-0 flex items-center ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3`}
                        />
                      ) : null}
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