// src/modules/common/components/localized-client-link.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface LocalizedClientLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  [key: string]: any
}

const LocalizedClientLink: React.FC<LocalizedClientLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  const pathname = usePathname()

  const localizedHref = useMemo(() => {
    const countryCode = pathname.split("/")[1] || ""
    const isDefaultCountry = countryCode === "" || countryCode === "us"
    const normalizedHref = href.startsWith("/") ? href : `/${href}`
    return isDefaultCountry ? normalizedHref : `/${countryCode}${normalizedHref}`
  }, [pathname, href])

  return (
    <Link href={localizedHref} className={className} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink