"use client";

import React from "react";
import Carousel from "@modules/common/components/carousel";
import ProductCard from "@modules/products/components/product-card";
import ProductCardGridLoader from "@modules/common/components/loaders/product-grid-card-loader";
import NotFoundItem from "@modules/common/components/not-found-item";
import HomeSectionHeader from "@modules/home/components/home-section-header";
import Alert from "@modules/common/components/alert";
import Text from "@modules/common/components/text";
import { SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";

const breakpoints = {
  "1500": {
    slidesPerView: 4,
    spaceBetween: 28,
  },
  "1025": {
    slidesPerView: 4,
    spaceBetween: 20,
  },
  "768": {
    slidesPerView: 2,
    spaceBetween: 20,
  },
  "480": {
    slidesPerView: 2,
    spaceBetween: 12,
  },
  "0": {
    slidesPerView: 2,
    spaceBetween: 12,
  },
};

export default function NewArrivalsProductFeed({
  products,
  isLoading,
  error,
  region,
}: {
  products: HttpTypes.StoreProduct[];
  isLoading: boolean;
  error: { message: string } | null;
  region: HttpTypes.StoreRegion | null;
}) {
  const { t } = useTranslation("common");

  if (!isLoading && isEmpty(products)) {
    console.log("Rendering NotFoundItem in NewArrivalsProductFeed");
    return (
      <div className="text-center p-5 text-base text-gray-700 bg-gray-100 rounded">
        <NotFoundItem text={t("text-no-products-found")} />
      </div>
    );
  }

  return (
    <div className="mb-12 md:mb-14 xl:mb-16 2xl:pt-2">
      <div className="text-center">
        <HomeSectionHeader sectionHeading="text-new-arrivals" />
        <div className="home-collection-text-block mt-4">
          <LocalizedClientLink href="/products">
            <Text className="btn-home-collection max-w-[130px] min-w-[90px] tracking-[0.3em] border text-xs mx-auto my-0 px-3.5 py-2 border-solid border-[#e8e8eb]">
              {t("text-view-all")}
            </Text>
          </LocalizedClientLink>
        </div>
      </div>

      {error ? (
        <Alert
          message={error.message}
          closeable={true}
          onClose={() => {}}
        />
      ) : (
        <Carousel
          autoplay={{ delay: 3500 }}
          breakpoints={breakpoints}
          buttonClassName="hidden"
          prevActivateId="newArrivalsSlidePrev"
          nextActivateId="newArrivalsSlideNext"
          className="mt-6"
        >
          {isLoading && !products?.length
            ? Array.from({ length: 10 }).map((_, idx) => (
                <SwiperSlide key={`new-arrivals-loader-${idx}`} className="h-full">
                  <ProductCardGridLoader
                    uniqueKey={`new-arrivals-loader-${idx}`}
                    variant="gridSlim"
                  />
                </SwiperSlide>
              ))
            : products?.map((product) => (
                <SwiperSlide key={`new-arrivals-product-${product.id}`} className="h-full">
                  <ProductCard product={product} variant="gridSlim" region={region} />
                </SwiperSlide>
              ))}
        </Carousel>
      )}
    </div>
  );
}