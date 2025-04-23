"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LocalizedClientLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const LocalizedClientLink: React.FC<LocalizedClientLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  const pathname = usePathname();
  const countryCode = pathname.split("/")[1] || ""; // Default to empty string if undefined
  const isDefaultCountry = countryCode === "" || countryCode === "us"; // Default if no countryCode or "us"

  // Ensure href starts with a slash
  const normalizedHref = href.startsWith("/") ? href : `/${href}`;

  // Only prepend countryCode if it's not the default ("us") and a countryCode exists in the URL
  const localizedHref = isDefaultCountry ? normalizedHref : `/${countryCode}${normalizedHref}`;

  return (
    <Link href={localizedHref} className={className} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedClientLink;