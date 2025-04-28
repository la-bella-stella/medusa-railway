"use client";

import React, { useState, Suspense } from "react";
import { HttpTypes } from "@medusajs/types";
import ImageGallery from "@modules/products/components/image-gallery";
import ProductActions from "@modules/products/components/product-actions";
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import ProductInfo from "@modules/products/templates/product-info";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import Subscription from "@modules/common/components/subscription";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useSanitizeContent } from "@lib/sanitize-content";

// Simple Breadcrumb component
const Breadcrumb: React.FC<{ productTitle: string }> = ({ productTitle }) => (
  <div className="text-xs text-gray-500 mb-2">
    <a href="/" className="hover:underline">Home</a> /{" "}
    <a href="/products" className="hover:underline">Products</a> /{" "}
    <span className="text-gray-700">{productTitle}</span>
  </div>
);

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
  };
  region: HttpTypes.StoreRegion;
  countryCode: string;
  relatedProducts?: HttpTypes.StoreProduct[];
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  relatedProducts = [],
}) => {
  const { t } = useTranslation("common");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isSpecificationOpen, setIsSpecificationOpen] = useState(true);
  const [selectedVariant, setSelectedVariant] =
    useState<HttpTypes.StoreProductVariant>();
  const content = useSanitizeContent({ description: product.description });

  const toggleDescription = () =>
    setIsDescriptionOpen((open) => !open);
  const toggleSpecifications = () =>
    setIsSpecificationOpen((open) => !open);

  return (
    <div className="mx-auto max-w-[1920px] px-4 md:px-4 lg:px-6">
      {/* Breadcrumbs moved to top left */}
      <div className="pt-7">
        <Breadcrumb productTitle={product.title} />
      </div>

      {/* === First row: Gallery + Main Details === */}
      <div className="items-start block grid-cols-9 lg:grid gap-x-10 xl:gap-x-14">
        {/* Gallery */}
        <div className="col-span-5">
          <ImageGallery images={product.images || []} />
        </div>

        {/* Product info, title, actions */}
        <div className="col-span-4 pt-8 lg:pt-0">
          <div className="pb-7 mb-7 border-b border-gray-300">
            <ProductInfo product={product} variant={selectedVariant} />
            <p className="text-body text-center mt-8 text-base lg:text-base leading-6 lg:leading-8 uppercase tracking-wide">
              {t("text-free-shipping", "FREE SHIPPING & EASY RETURNS")}
            </p>
          </div>

          <div className="flex items-center py-8 space-x-4 border-b border-gray-300">
            <Suspense
              fallback={
                <ProductActions disabled product={product} region={region} />
              }
            >
              <ProductActions
                product={product}
                region={region}
                onVariantChange={setSelectedVariant}
              />
            </Suspense>
            <ProductOnboardingCta />
          </div>
        </div>
      </div>

      {/* === Second row: Specifications & Description === */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-x-10 xl:gap-x-14 pt-7 pb-10 lg:pb-14 2xl:pb-20 items-start">
        {/* Specifications (left on desktop) */}
        <div className="col-span-5 order-2 lg:order-1">
          <div className="pb-7 mb-7 pt-7 md:pt-0 border-b border-gray-300">
            <button
              className="relative inline-flex items-center justify-between w-full font-semibold text-heading text-lg"
              onClick={toggleSpecifications}
            >
              {t("text-specifications")}
              {isSpecificationOpen ? (
                <FaChevronUp className="text-base" />
              ) : (
                <FaChevronDown className="text-base" />
              )}
            </button>
          </div>

          <Transition
            as="div"
            show={isSpecificationOpen}
            enter="transition-all duration-300 ease-in-out"
            enterFrom="max-h-0 opacity-0"
            enterTo="max-h-screen opacity-100"
            leave="transition-all duration-200 ease-in-out"
            leaveFrom="max-h-screen opacity-100"
            leaveTo="max-h-0 opacity-0"
          >
            <ProductTabs product={product} />
          </Transition>
        </div>

        {/* Description (right on desktop) */}
        <div className="col-span-5 md:col-span-4 pt-8 lg:pt-0 order-1 lg:order-2">
          <div className="pb-7 mb-7 border-b border-gray-300">
            <button
              className="relative inline-flex items-center justify-between w-full font-semibold text-heading text-lg"
              onClick={toggleDescription}
            >
              {t("text-description")}
              {isDescriptionOpen ? (
                <FaChevronUp className="text-base" />
              ) : (
                <FaChevronDown className="text-base" />
              )}
            </button>
          </div>

          <Transition
            as="div"
            show={isDescriptionOpen}
            enter="transition-all duration-300 ease-in-out"
            enterFrom="max-h-0 opacity-0"
            enterTo="max-h-screen opacity-100"
            leave="transition-all duration-200 ease-in-out"
            leaveFrom="max-h-screen opacity-100"
            leaveTo="max-h-0 opacity-0"
          >
            {content && (
              <div
                className="desc-pdp my-5 text-body text-sm lg:text-base leading-6 lg:leading-8"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </Transition>
        </div>
      </div>

      {/* Related products + subscription */}
      <div className="my-10 small:my-16">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts
            product={product}
            region={region}
            countryCode={countryCode}
            relatedProducts={relatedProducts}
            sectionHeading="text-related-products"
          />
        </Suspense>
      </div>

      <div className="my-10 small:my-16 text-center">
        <Subscription />
      </div>
    </div>
  );
};

export default ProductTemplate;