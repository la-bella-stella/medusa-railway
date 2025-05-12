// src/modules/common/components/logo/index.tsx
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import cn from "classnames";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ className, onClick }) => {
  // Hardcode logo and siteTitle for now; integrate Medusa settings later
  const logo = { original: "/assets/images/La-Bella-logo.webp" }; // Placeholder; replace with actual logo URL
  const siteTitle = "La Bella Stella"; // Placeholder; replace with dynamic value
  const logoHeight = 100; // Placeholder; adjust as needed
  const logoWidth = 200; // Placeholder; adjust as needed

  const logoSrc = logo?.original ?? "/logo.png"; // Fallback to hardcoded value

  return (
    <LocalizedClientLink
      href="/"
      className={cn("inline-flex focus:outline-none shrink-0", className)}
      onClick={onClick}
    >
      <Image
        src={logoSrc}
        alt={siteTitle || "Medusa Store Logo"}
        height={logoHeight}
        width={logoWidth}
        priority
        sizes="(max-width: 768px) 100vw"
      />
    </LocalizedClientLink>
  );
};

export default Logo;