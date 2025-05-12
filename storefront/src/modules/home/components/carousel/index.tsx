// src/modules/common/components/carousel/index.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Import Swiper styles

interface CarouselProps {
  children: React.ReactNode;
  breakpoints: Record<string, { slidesPerView: number; spaceBetween: number }>;
  autoplay: { delay: number };
  prevActivateId?: string;
  nextActivateId?: string;
  buttonClassName?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  breakpoints,
  autoplay,
  prevActivateId,
  nextActivateId,
  buttonClassName,
}) => {
  return (
    <Swiper
      breakpoints={breakpoints}
      autoplay={autoplay}
      navigation={{
        prevEl: `#${prevActivateId}`,
        nextEl: `#${nextActivateId}`,
      }}
      className="mySwiper"
    >
      {children}
    </Swiper>
  );
};

export default Carousel;