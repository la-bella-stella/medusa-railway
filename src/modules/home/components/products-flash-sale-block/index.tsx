// src/modules/home/components/products-flash-sale-block/index.tsx
"use client";
import HomeSectionHeader from "@modules/home/components/home-section-header";
import ProductCard from "@modules/products/components/product-card";
import ProductCardGridLoader from "@modules/common/components/loaders/product-grid-card-loader";
import Alert from "@modules/common/components/alert";
import NotFoundItem from "@modules/common/components/not-found-item";
import Carousel from "@modules/common/components/carousel";
import { SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";

interface ProductsProps {
  sectionHeading?: string;
  className?: string;
  date?: any;
  variant?: "default" | "slider";
  limit?: number;
  products: any[];
  isLoading: boolean;
  error: any;
}

const breakpoints = {
  "1500": {
    slidesPerView: 5,
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

const ProductsFlashSaleBlock: React.FC<ProductsProps> = ({
  sectionHeading = "text-flash-sale",
  className = "mb-12 md:mb-14 xl:mb-16",
  variant = "default",
  limit = 10,
  products,
  isLoading,
  error,
}) => {
  const { t } = useTranslation("common");

  if (!isLoading && isEmpty(products)) {
    return <NotFoundItem text={t("text-no-flash-products-found")} />;
  }

  return (
    <div
      className={`${className} ${
        variant === "default"
          ? "border border-gray-300 rounded-md pt-5 md:pt-6 lg:pt-7 pb-5 lg:pb-7 px-4 md:px-5 lg:px-7"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-center mb-5 md:mb-6">
        <HomeSectionHeader sectionHeading={sectionHeading} className="mb-0" />
      </div>
      {error ? (
        <Alert message={error?.message} />
      ) : (
        <div
          className={`${
            variant === "default"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-4 lg:gap-y-5 xl:lg:gap-y-6 2xl:gap-y-8"
              : "block"
          }`}
        >
          {isLoading && !products?.length ? (
            Array.from({ length: 10 }).map((_, idx) => (
              variant === "default" ? (
                <ProductCardGridLoader
                  key={idx}
                  uniqueKey={`flash-sale-${idx}`}
                  variant="gridSlim"
                />
              ) : (
                <SwiperSlide key={`flash-sale-${idx}`}>
                  <ProductCardGridLoader
                    uniqueKey={`flash-sale-${idx}`}
                    variant="gridSlim"
                  />
                </SwiperSlide>
              )
            ))
          ) : (
            <>
              {variant === "default" ? (
                products?.map((product: any) => (
                  <ProductCard
                    key={`product--key${product.id}`}
                    product={product}
                    variant="gridSlim"
                  />
                ))
              ) : (
                <Carousel
                  breakpoints={breakpoints}
                  buttonClassName="-mt-8 md:-mt-10 hidden"
                  autoplay={{
                    delay: 3500,
                  }}
                  prevActivateId="flashSellSlidePrev"
                  nextActivateId="flashSellSlideNext"
                >
                  {products?.map((product: any) => (
                    <SwiperSlide key={`product--key-${product.id}`}>
                      <ProductCard
                        key={`product--key${product.id}`}
                        product={product}
                        variant="gridSlim"
                      />
                    </SwiperSlide>
                  ))}
                </Carousel>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsFlashSaleBlock;