"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import LocalizedClientLink from "@modules/common/components/localized-client-link"; // Default link component

interface BreadcrumbItem {
  label: string;
  href?: string;
  linkComponent?: React.ComponentType<any>; // Allow custom link component
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
  activeClassName?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = "/",
  className = "text-sm text-gray-600 mb-4",
  activeClassName = "font-semibold text-heading",
}) => {
  const { t } = useTranslation("common");
  const pathname = usePathname();

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const LinkComponent = item.linkComponent || LocalizedClientLink;

        return (
          <span key={index}>
            {item.href && !isLast ? (
              <LinkComponent
                href={item.href}
                className={pathname === item.href ? activeClassName : "hover:underline"}
              >
                {t(item.label, item.label)}
              </LinkComponent>
            ) : (
              <span className={isLast ? activeClassName : "hover:underline"}>
                {t(item.label, item.label)}
              </span>
            )}
            {!isLast && <span className="mx-2">{separator}</span>}
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;