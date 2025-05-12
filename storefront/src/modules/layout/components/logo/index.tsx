// src/modules/layout/components/logo/index.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import cn from "classnames";
import { siteSettings } from "@lib/config/site-settings"; // Add this

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <Link
      href="/"
      className={cn("inline-flex focus:outline-none shrink-0", className)}
      {...props}
    >
      <Image
        src={siteSettings.logo.url}
        alt={siteSettings.siteTitle || "MyStore Logo"}
        height={siteSettings.logo.height}
        width={siteSettings.logo.width}
        priority
        sizes="(max-width: 768px) 100vw"
      />
    </Link>
  );
};

export default Logo;