import React, { useState, useRef, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import Carousel from "@modules/common/components/carousel"
import { SwiperSlide } from "swiper/react"
import useWindowSize from "react-use/lib/useWindowSize"

const productGalleryCarouselResponsive = {
  "768": {
    slidesPerView: 2,
    spaceBetween: 12,
  },
  "0": {
    slidesPerView: 1,
  },
}

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const { width } = useWindowSize()
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imgErrorIndex, setImgErrorIndex] = useState<Record<number, boolean>>({})
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [activeIndex])

  // Determine mobile only after mount to avoid SSR mismatch
  const isMobile = mounted && width < 1025

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center transition duration-150 ease-in hover:opacity-90">
        <div className="w-full max-w-[475px] aspect-[3/4] relative">
          <Image
            src="/assets/placeholder/products/product-gallery.svg"
            alt="Default product image"
            fill
            className="object-cover"
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {isMobile ? (
        <Carousel
          pagination={{ clickable: true }}
          breakpoints={productGalleryCarouselResponsive}
          className="product-gallery"
          buttonClassName="hidden"
        >
          {images.map((item, index) => (
            <SwiperSlide key={`product-gallery-key-${index}`}>
              <div className="col-span-1 transition duration-150 ease-in hover:opacity-90">
                <Image
                  loading="lazy"
                  src={
                    imgErrorIndex[index]
                      ? "/assets/placeholder/products/product-gallery.svg"
                      : item.url ?? "/assets/placeholder/products/product-gallery.svg"
                  }
                  onError={() => setImgErrorIndex((prev) => ({ ...prev, [index]: true }))}
                  alt={`Product image ${index}`}
                  layout="responsive"
                  objectFit="contain"
                  width={580}
                  height={580}
                  className="w-full"
                />
              </div>
            </SwiperSlide>
          ))}
        </Carousel>
      ) : (
        <div className="grid grid-cols-5 gap-2.5">
          <div className="col-span-1 relative">
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[580px] pr-1">
              {images.map((item, index) => (
                <div
                  key={index}
                  ref={(el) => { itemRefs.current[index] = el }}
                  className={`cursor-pointer transition duration-150 ease-in hover:opacity-90 ${
                    index === activeIndex ? "border border-black" : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <Image
                    loading="lazy"
                    src={
                      imgErrorIndex[index]
                        ? "/assets/placeholder/products/product-gallery.svg"
                        : item.url ?? "/assets/placeholder/products/product-gallery.svg"
                    }
                    onError={() => setImgErrorIndex((prev) => ({ ...prev, [index]: true }))}
                    alt={`Product thumbnail ${index}`}
                    width={80}
                    height={80}
                    objectFit="contain"
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-4">
            <Image
              loading="lazy"
              src={
                imgErrorIndex[activeIndex]
                  ? "/assets/placeholder/products/product-gallery.svg"
                  : images[activeIndex]?.url ?? "/assets/placeholder/products/product-gallery.svg"
              }
              onError={() => setImgErrorIndex((prev) => ({ ...prev, [activeIndex]: true }))}
              alt="Product main image"
              layout="responsive"
              objectFit="contain"
              height={580}
              width={580}
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery;
