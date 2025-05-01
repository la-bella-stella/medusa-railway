import React, { useState } from "react";
import { usePopper } from "react-popper";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MegaMenu from "@modules/layout/components/mega-menu";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import {
  RESPONSIVE_WIDTH,
  checkIsMaintenanceModeComing,
  checkIsMaintenanceModeStart,
  checkIsScrollingStart,
} from "@lib/config/constants";
import { useWindowSize } from "react-use";
import { useAtom } from "jotai";
import Alert from "@modules/common/components/alert";
import CountdownTimer from "@modules/common/components/countdown-timer";

interface MenuProps {
  data: Array<{
    id: string | number;
    path: string;
    label: string;
    columns?: any[];
    image?: string;
  }>;
  className?: string;
}

const HeaderMenu: React.FC<MenuProps> = ({ data, className }) => {
  const { t } = useTranslation("menu");
  const { width } = useWindowSize();
  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  const [, setUnderMaintenanceStart] = useAtom(checkIsMaintenanceModeStart);
  const [isScrolling] = useAtom(checkIsScrollingStart);

  return (
    <>
      {width >= RESPONSIVE_WIDTH && underMaintenanceIsComing && !isScrolling && (
        <Alert
          message={t("text-maintenance-mode-title")}
          variant="info"
          className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200"
          childClassName="flex justify-center items-center w-full gap-4 text-sm text-gray-700 py-2"
        >
          <CountdownTimer
            date={new Date("2025-07-11T05:00:00")}
            className="text-gray-700 [&>p]:bg-gray-100 [&>p]:p-1 [&>p]:text-xs [&>p]:rounded"
            onComplete={() => setUnderMaintenanceStart(true)}
          />
        </Alert>
      )}

      <nav
        className={classNames(
          "headerMenu flex justify-center w-full relative lg:py-2",
          className
        )}
      >
        <div className="flex items-center max-w-[1920px] mx-auto px-4">
          {data.map((item, index) => {
            const [referenceElement, setReferenceElement] =
              useState<HTMLElement | null>(null);
            const [popperElement, setPopperElement] =
              useState<HTMLDivElement | null>(null);

            const { styles, attributes } = usePopper(
              referenceElement,
              popperElement,
              {
                placement: "bottom",
                modifiers: [
                  { name: "offset", options: { offset: [0, 10] } },
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      padding: 16,
                    },
                  },
                  {
                    name: "flip",
                    options: {
                      fallbackPlacements: ["top", "bottom"],
                    },
                  },
                ],
              }
            );

            return (
              <div key={item.id} className="menuItem group cursor-pointer px-4">
                <LocalizedClientLink
                  href={item.path}
                  className={classNames(
                    "relative inline-flex items-center py-2 transition-colors font-normal",
                    {
                      "text-red-500 hover:text-red-600":
                        index === data.length - 1,
                    }
                  )}
                  ref={setReferenceElement}
                >
                  {t(item.label.trim())}
                </LocalizedClientLink>

                {item.columns && (
                  <div
                    ref={setPopperElement}
                    style={{ ...styles.popper, minWidth: "200px" }}
                    {...attributes.popper}
                    className="megaMenu opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                  >
                    <MegaMenu columns={item.columns} image={item.image} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default HeaderMenu;