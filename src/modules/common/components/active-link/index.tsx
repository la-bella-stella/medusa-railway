"use client";

import type { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

// Utility to convert Url (string or UrlObject) to string
const stringifyUrl = (url: LinkProps["href"]): string => {
  if (typeof url === "string") {
    return url;
  }
  // Handle UrlObject
  const { pathname, query, hash } = url;
  let result = pathname || "";
  if (query) {
    const queryString =
      typeof query === "string"
        ? query
        : Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
    if (queryString) {
      result += `?${queryString}`;
    }
  }
  if (hash) {
    result += hash;
  }
  return result;
};

interface ActiveLinkProps extends LinkProps {
  activeClassName?: string;
  children: React.ReactNode; // Made required
  className?: string;
}

const ActiveLink: React.FC<
  ActiveLinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">
> = ({ href, className, activeClassName = "active", children, ...props }) => {
  const pathname = usePathname();
  const hrefString = stringifyUrl(href);

  return (
    <LocalizedClientLink
      href={hrefString}
      className={classNames(className, {
        [activeClassName]: pathname === hrefString,
      })}
      {...props}
    >
      {children}
    </LocalizedClientLink>
  );
};

export default ActiveLink;