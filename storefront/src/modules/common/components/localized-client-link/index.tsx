"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

// Configurable default country code
const DEFAULT_COUNTRY_CODE = "us";

interface LocalizedClientLinkProps extends Omit<React.ComponentProps<typeof Link>, "href"> {
  href: string; // Explicitly required
  children: React.ReactNode; // Explicitly required
  className?: string;
}

const LocalizedClientLink: React.FC<LocalizedClientLinkProps> = ({
  href,
  children,
  className,
  ...restProps
}) => {
  const params = useParams();
  const countryCode = (params.countryCode as string) || DEFAULT_COUNTRY_CODE;

  const localizedHref = useMemo(() => {
    const isDefaultCountry = countryCode === DEFAULT_COUNTRY_CODE;
    const normalizedHref = href.startsWith("/") ? href : `/${href}`;
    return isDefaultCountry ? normalizedHref : `/${countryCode}${normalizedHref}`;
  }, [countryCode, href]);

  return (
    <Link href={localizedHref} className={className} {...restProps}>
      {children}
    </Link>
  );
};

export default LocalizedClientLink;