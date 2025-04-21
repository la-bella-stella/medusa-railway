// src/modules/home/components/banner-card/index.tsx
import type { FC } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";
import cn from "classnames";

interface BannerProps {
  data: { id: number; slug: string; image: { mobile: { url: string }; desktop: { url: string } }; title: string };
  variant?: "rounded" | "default";
  effectActive?: boolean;
  className?: string;
  classNameInner?: string;
  href: string; // Changed from LinkProps["href"] to string
}

const BannerCard: FC<BannerProps> = ({
  data,
  className,
  variant = "rounded",
  effectActive = false,
  classNameInner,
  href,
}) => {
  const { title, image } = data;

  return (
    <div className={cn("mx-auto w-full", className)}>
      <LocalizedClientLink
        href={href} // Now matches the expected string type
        className={cn(
          "group flex justify-center relative overflow-hidden w-full",
          classNameInner
        )}
      >
        <Image
          src={image.mobile.url}
          fill
          alt={title}
          quality={100}
          className={cn("bg-gray-300 object-cover w-full sm:hidden", {
            "rounded-md": variant === "rounded",
          })}
          sizes="(max-width: 768px) 100vw"
          priority
        />
        <Image
          src={image.desktop.url}
          fill
          alt={title}
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
        {data.title && (
          <div className="absolute right-4 bottom-0 -translate-y-1/2 text-white text-sm sm:text-base md:text-lg font-semibold z-10 bg-black bg-opacity-50 px-3 py-2 rounded">
            {data.title}
          </div>
        )}
      </LocalizedClientLink>
    </div>
  );
};

export default BannerCard;