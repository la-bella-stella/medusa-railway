// src/modules/layout/components/header-menu/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MegaMenu from "@modules/layout/components/mega-menu";
import classNames from "classnames";
import ListMenu from "@modules/layout/components/list-menu";
import { useTranslation } from "next-i18next";
import {
  RESPONSIVE_WIDTH,
  checkIsMaintenanceModeComing,
  checkIsMaintenanceModeStart,
  checkIsScrollingStart,
} from "@lib/constants";
import { useWindowSize } from "react-use";
import Alert from "@modules/layout/components/alert";
import CountdownTimer from "@modules/layout/components/countdown-timer";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { useSettings } from "@contexts/settings.context"; // Will migrate

interface MenuProps {
  data: any;
  className?: string;
}

const HeaderMenu: React.FC<MenuProps> = ({ data, className }) => {
  const { t } = useTranslation("menu");
  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  const [__, setUnderMaintenanceStart] = useAtom(checkIsMaintenanceModeStart);
  const [isScrolling] = useAtom(checkIsScrollingStart);
  const { settings } = useSettings();
  const { width } = useWindowSize();

  return (
    <>
      {width >= RESPONSIVE_WIDTH && underMaintenanceIsComing && !isScrolling ? (
        <Alert
          message={t("text-maintenance-mode-title")}
          variant="info"
          className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200"
          childClassName="flex justify-center items-center w-full gap-4 text-sm font-semibold text-gray-700 py-2"
        >
          <CountdownTimer
            date={new Date(settings?.maintenance?.start as string)}
            className="text-gray-700 [&>p]:bg-gray-100 [&>p]:p-1 [&>p]:text-xs [&>p]:rounded"
            onComplete={() => setUnderMaintenanceStart(true)}
          />
        </Alert>
      ) : null}

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
                    "relative inline-flex items-center py-2 text-sm font-medium text-gray-700 transition-colors",
                    {
                    "text-red-500 hover:text-red-600": index === data.length - 1,
                    }
                )}
                >
                {t(item.label)}
                </LocalizedClientLink>

              {item?.columns && Array.isArray(item.columns) && (
                <MegaMenu columns={item.columns} image={item.image} />
              )}

              {item?.subMenu && Array.isArray(item.subMenu) && (
                <div className="absolute bg-white opacity-0 subMenu shadow-lg border border-gray-100 ltr:left-0 rtl:right-0 group-hover:opacity-100 transition-opacity duration-300 lg:mt-7">
                  <ul className="py-4 text-sm text-gray-600">
                    {item.subMenu.map((menu: any, index: number) => {
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
              )}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default HeaderMenu;