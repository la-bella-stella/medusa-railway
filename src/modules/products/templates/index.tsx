// src/modules/products/templates/index.tsx
"use client";

import React, { useState, forwardRef } from "react";
import { HttpTypes } from "@medusajs/types";
import ImageGallery from "@modules/products/components/image-gallery";
import ProductActions from "@modules/products/components/product-actions";
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import ProductInfo from "@modules/products/templates/product-info";
import ProductActionsWrapper from "./product-actions-wrapper";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import Subscription from "@modules/common/components/subscription";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Transition } from "@headlessui/react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useSanitizeContent } from "@lib/sanitize-content";

// Simple Breadcrumb component
const Breadcrumb: React.FC<{ productTitle: string }> = ({ productTitle }) => {
  return (
    <div className="text-xs text-gray-500 mb-2">
      <a href="/" className="hover:underline">
        Home
      </a>{" "}
      /{" "}
      <a href="/products" className="hover:underline">
        Products
      </a>{" "}
      / <span className="text-gray-700">{productTitle}</span>
    </div>
  );
};

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
  const [selectedVariant, setSelectedVariant] = useState<
    HttpTypes.StoreProductVariant | undefined
  >(undefined);

  const content = useSanitizeContent({ description: product.description });

  const toggleDescription = () => {
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  const toggleSpecifications = () => {
    setIsSpecificationOpen(!isSpecificationOpen);
  };

  const TransitionWrapper = forwardRef<
    HTMLDivElement,
    { children: React.ReactNode }
  >(({ children }, ref) => <div ref={ref}>{children}</div>);
  TransitionWrapper.displayName = "TransitionWrapper";

  return (
    <div className="mx-auto max-w-[1920px] px-4 md:px-4 lg:px-6">
      <div className="items-start block grid-cols-9 lg:grid gap-x-10 xl:gap-x-14 pt-7 pb-10 lg:pb-14 2xl:pb-20">
        {/* Gallery Section */}
        <div className="col-span-5">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* Product Details Section */}
        <div className="col-span-4 pt-7 lg:pt-0">
          <div className="pb-3 mb-3">
            <Breadcrumb productTitle={product.title} />
            <ProductInfo product={product} variant={selectedVariant} />
            <p className="text-gray-500 text-xs text-center mt-3 leading-4 uppercase tracking-wide">
              {t("text-free-shipping", "FREE SHIPPING & EASY RETURNS")}
            </p>
          </div>

          <div className="flex items-center py-3 space-x-2 border-b border-gray-200">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
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

          {/* Collapsible Description and Specifications */}
          <div className="pt-3 pb-6 lg:pb-8">
            <div className="pb-3 mb-3 border-b border-gray-200">
              <button
                className="relative inline-flex items-center justify-between w-full font-semibold text-base uppercase text-heading"
                onClick={toggleSpecifications}
              >
                {t("text-specifications")}
                {isSpecificationOpen ? (
                  <FaChevronUp className="text-xs" />
                ) : (
                  <FaChevronDown className="text-xs" />
                )}
              </button>
            </div>
            <Transition
              show={isSpecificationOpen}
              enter="transition-all duration-300 ease-in-out"
              enterFrom="max-h-0 opacity-0"
              enterTo="max-h-screen opacity-100"
              leave="transition-all duration-200 ease-in-out"
              leaveFrom="max-h-screen opacity-100"
              leaveTo="max-h-0 opacity-0"
            >
              <TransitionWrapper>
                <ProductTabs product={product} />
              </TransitionWrapper>
            </Transition>

            <div className="pb-3 mb-3 border-b border-gray-200 mt-4">
              <button
                className="relative inline-flex items-center justify-between w-full font-semibold text-base uppercase text-heading"
                onClick={toggleDescription}
              >
                {t("text-description")}
                {isDescriptionOpen ? (
                  <FaChevronUp className="text-xs" />
                ) : (
                  <FaChevronDown className="text-xs" />
                )}
              </button>
            </div>
            <Transition
              show={isDescriptionOpen}
              enter="transition-all duration-300 ease-in-out"
              enterFrom="max-h-0 opacity-0"
              enterTo="max-h-screen opacity-100"
              leave="transition-all duration-200 ease-in-out"
              leaveFrom="max-h-screen opacity-100"
              leaveTo="max-h-0 opacity-0"
            >
              <TransitionWrapper>
                <div
                  className="my-5 text-body text-sm lg:text-base leading-6 lg:leading-8 desc-pdp"
                  dangerouslySetInnerHTML={{ __html: content ?? (product.description ?? "") }}
                />
              </TransitionWrapper>
            </Transition>
          </div>
        </div>
      </div>

      {/* Related Products */}
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

      {/* Newsletter Signup Section */}
      <div className="my-10 small:my-16 text-center">
        <Subscription />
      </div>
    </div>
  );
};

export default ProductTemplate;