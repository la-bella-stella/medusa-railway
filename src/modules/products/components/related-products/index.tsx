"use client";

import React from "react";
import Carousel from "@modules/common/components/carousel";
import ProductCard from "@modules/products/components/product-card";
import { SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import HomeSectionHeader from "@modules/home/components/home-section-header";
import { HttpTypes } from "@medusajs/types";

const breakpoints = {
  "1500": { slidesPerView: 4, spaceBetween: 28 },
  "1025": { slidesPerView: 4, spaceBetween: 20 },
  "768":  { slidesPerView: 2, spaceBetween: 20 },
  "480":  { slidesPerView: 2, spaceBetween: 12 },
  "0":    { slidesPerView: 2, spaceBetween: 12 },
};

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion | null;
  countryCode: string;
  relatedProducts?: HttpTypes.StoreProduct[];
  sectionHeading?: string;
};

export default function RelatedProducts({
  product,
  region,
  countryCode,
  relatedProducts = [],
  sectionHeading = "text-related-products",
}: RelatedProductsProps) {
  const { t } = useTranslation("common");

  if (!region || isEmpty(relatedProducts)) {
    return null;
  }

  return (
    <div className="mb-12 md:mb-14 xl:mb-16 2xl:pt-2">
      <div className="text-center">
        <HomeSectionHeader sectionHeading={sectionHeading} />
      </div>

      <Carousel
        autoplay={{ delay: 3500 }}
        breakpoints={breakpoints}
        buttonClassName="hidden"
        prevActivateId="relatedProductsSlidePrev"
        nextActivateId="relatedProductsSlideNext"
        className="mt-6"
      >
        {relatedProducts.map((related) => (
          <SwiperSlide
            key={`related-product-${related.id}`} 
            className="h-full"
          >
            <ProductCard 
              product={related} 
              variant="gridSlim" 
              region={region} 
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
}
