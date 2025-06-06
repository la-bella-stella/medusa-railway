"use client";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";
import Text from "@modules/common/components/text";
import { useTranslation } from "react-i18next";
import cn from "classnames";

interface Props {
  imgWidth?: number;
  imgHeight?: number;
  variant?: "default" | "modern" | "trendy" | "full";
  collection: {
    slug: string;
    image: string;
    title: string;
    description?: string;
  };
}

const HomeCollectionCard: React.FC<Props> = ({
  collection,
  imgWidth = 580,
  imgHeight = 580,
  variant = "default",
}) => {
  const { t, ready } = useTranslation("common");
  const { slug, image, title } = collection;
  const isFull = variant === "full";

  if (!ready) return <div>Loading...</div>;

  return (
    <LocalizedClientLink
      href={slug}
      className={cn(
        "group text-center flex flex-col overflow-hidden rounded-md pb-4 sm:pb-0",
        {
          "justify-between sm:even:flex-col-reverse": variant === "default",
          "!pb-0": variant === "trendy",
        }
      )}
    >
      <div className={cn("relative", isFull ? "" : "mx-auto")}>
        <Image
          src={image ?? "/assets/placeholder/collection.svg"}
          alt={t("title") || t("text-card-thumbnail")}
          width={imgWidth}
          height={imgHeight}
          className={cn(
            "bg-gray-300 object-cover sm:rounded-md transition duration-200 ease-in-out group-hover:opacity-90",
            {
              "w-full h-auto": isFull,
            }
          )}
          priority
        />

        {variant === "trendy" && (
          <div className="absolute bottom-[-12px] right-[-12px] p-2" />
        )}
      </div>

      <div className="home-collection-text-block mt-2">
        <Text
          variant="heading"
          className="mb-1.5 lg:mb-2.5 2xl:mb-3 3xl:mb-3.5 font-normal text-base collection-title"
        >
          {t(title)}
        </Text>
        <Text className="btn-home-collection max-w-[130px] min-w-[90px] tracking-[0.3em] border text-xs mx-auto my-0 px-3.5 py-2 border-solid border-[#e8e8eb]">
          {t("text-shop-now")}
        </Text>
      </div>
    </LocalizedClientLink>
  );
};

export default HomeCollectionCard;
