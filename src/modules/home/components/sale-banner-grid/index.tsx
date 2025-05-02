// src/modules/home/components/sale-banner-grid/index.tsx
"use client";
import BannerCard from "@modules/home/components/banner-card";
import Carousel from "@modules/common/components/carousel";
import { SwiperSlide } from "swiper/react";
import { saleBannerGrid } from "@lib/data/home-banner";

interface BannerProps {
  className?: string;
  limit?: number;
}

const SaleBannerGrid: React.FC<BannerProps> = ({
  className = "mb-12 lg:mb-14 xl:mb-16 lg:pb-1 xl:pb-0",
  limit = 4,
}) => {
  // console.log("SaleBannerGrid: Data:", saleBannerGrid);

  if (!saleBannerGrid || saleBannerGrid.length === 0) {
    return <div>No banners available.</div>;
  }

  return (
    <div className={className}>
      {/* Mobile: Carousel */}
      <div className="md:hidden">
        <Carousel
          breakpoints={{
            "0": { slidesPerView: 1, spaceBetween: 12 },
            "480": { slidesPerView: 1, spaceBetween: 12 },
          }}
          autoplay={{ delay: 5000 }}
          prevActivateId="saleBannerPrev"
          nextActivateId="saleBannerNext"
          buttonClassName="hidden"
        >
          {saleBannerGrid?.slice(0, limit).map((banner: any) => (
            <SwiperSlide key={banner.id}>
              <BannerCard
                data={banner}
                href={`/collections/${banner.slug}`}
                className="h-full"
                effectActive
                showButton={false}
                classNameInner="aspect-[2/1]"
              />
            </SwiperSlide>
          ))}
        </Carousel>
      </div>

      {/* Desktop: Unequal banners */}
      <div className="hidden md:grid grid-cols-2 gap-5 xl:gap-7">
        <div>
          {saleBannerGrid[0] && (
            <BannerCard
              key={saleBannerGrid[0].id}
              data={saleBannerGrid[0]}
              href={`/collections/${saleBannerGrid[0].slug}`}
              effectActive
              className="h-full"
              classNameInner="aspect-[4/3] lg:aspect-[1/1] h-full"
            />
          )}
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-5 xl:gap-7">
          {saleBannerGrid.slice(1, 3).map((banner: any) => (
            <BannerCard
              key={banner.id}
              data={banner}
              href={`/collections/${banner.slug}`}
              effectActive
              className=""
              classNameInner="aspect-[1/1]"
            />
          ))}

          {saleBannerGrid[3] && (
            <BannerCard
              key={saleBannerGrid[3].id}
              data={saleBannerGrid[3]}
              href={`/collections/${saleBannerGrid[3].slug}`}
              effectActive
              className="col-span-2"
              classNameInner="aspect-[2/1]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleBannerGrid;