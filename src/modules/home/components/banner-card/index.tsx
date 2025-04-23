// src/modules/home/components/banner-card/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";
import type { FC } from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";

interface BannerProps {
  data: any;
  variant?: "rounded" | "default";
  effectActive?: boolean;
  showButton?: boolean;
  className?: string;
  classNameInner?: string;
  href: string;
}

const BannerCard: FC<BannerProps> = ({
  data,
  className,
  variant = "rounded",
  effectActive = false,
  showButton = false,
  classNameInner,
  href,
}) => {
  const { t } = useTranslation("common");
  const { title, image } = data || {};
  const mobileImageUrl = image?.mobile?.url || "/assets/placeholder/collection.svg";
  const desktopImageUrl = image?.desktop?.url || "/assets/placeholder/collection.svg";
  const bannerTitle = title || t("text-banner-thumbnail");

  return (
    <div className={cn("mx-auto w-full rounded-md shadow-sm overflow-hidden", className)}>
      <LocalizedClientLink
        href={href}
        className={cn(
          "group flex justify-center relative overflow-hidden w-full",
          classNameInner
        )}
      >
        <Image
          src={mobileImageUrl}
          fill
          alt={bannerTitle}
          quality={100}
          className={cn("bg-gray-300 object-cover w-full sm:hidden", {
            "rounded-md": variant === "rounded",
          })}
          sizes="(max-width: 768px) 100vw"
          priority
        />
        <Image
          src={desktopImageUrl}
          fill
          alt={bannerTitle}
          quality={100}
          className={cn("bg-gray-300 object-cover w-full hidden sm:block", {
            "rounded-md": variant === "rounded",
          })}
          sizes="(max-width: 768px) 100vw"
          priority
        />
        {effectActive && (
          <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 -left-full z-5 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
        )}
        {bannerTitle && (
          <div className="absolute right-4 bottom-0 -translate-y-1/2 text-white text-sm sm:text-base md:text-lg font-semibold z-10 bg-black bg-opacity-50 px-3 py-2 rounded">
            {bannerTitle}
          </div>
        )}
        {showButton && (
          <div className="absolute bottom-4 left-4 z-10">
            <span className="inline-block max-w-[130px] min-w-[90px] tracking-[0.3em] border text-xs mx-auto my-0 px-3.5 py-2 border-solid border-[#e8e8eb] bg-white text-black group-hover:bg-gray-200 transition">
              {t("text-shop-now")}
            </span>
          </div>
        )}
      </LocalizedClientLink>
    </div>
  );
};

export default BannerCard;