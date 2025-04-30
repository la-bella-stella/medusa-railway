"use client";

import React, { useState, forwardRef, Suspense } from "react";
import Link from "next/link";
import createDOMPurify from "dompurify";
import { HttpTypes } from "@medusajs/types";
import ImageGallery from "@modules/products/components/image-gallery";
import ProductActions from "@modules/products/components/product-actions";
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import ProductInfo from "./product-info";
import ProductActionsWrapper from "./product-actions-wrapper";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Transition } from "@headlessui/react";
import { StoreProductWithTags } from "types/global";

const _window = typeof window !== "undefined" ? window : ({} as any);
const DOMPurify = createDOMPurify(_window);

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
    handle: string;
    subtitle?: string | null;
    description?: string | null;
    material?: string | null;
    origin_country?: string | null;
    metadata?: {
      season?: string | null;
      gender?: string | null;
    };
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
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isSpecificationOpen, setIsSpecificationOpen] = useState(true);
  const toggleDescription = () => setIsDescriptionOpen((o) => !o);
  const toggleSpecifications = () => setIsSpecificationOpen((o) => !o);

  const TransitionWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
    ({ children }, ref) => <div ref={ref}>{children}</div>
  );
  TransitionWrapper.displayName = "TransitionWrapper";

  const productForInfo: StoreProductWithTags & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
  } = {
    ...product,
    tags: product.tags ?? undefined,
    variants: product.variants ?? null,
  };

  const sanitizeHtml = (html: string) => {
    if (DOMPurify && typeof DOMPurify.sanitize === "function") {
      try {
        return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
      } catch {
        return html;
      }
    }
    return html;
  };

  const subtitleHasBlocks = Boolean(
    product.subtitle && /<(ul|ol|li|p|h[1-6])/.test(product.subtitle)
  );

  const combinedDescHtml = subtitleHasBlocks
    ? `${product.subtitle ?? ""}${product.description ?? ""}`
    : product.description ?? "";

  return (
    <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
      <div className="pt-12">
        <div className="flex items-center chawkbazarBreadcrumb">
          <ol className="flex items-center w-full overflow-hidden">
            <li className="text-sm text-body px-2.5 transition duration-200 ease-in first:pl-0 last:pr-0 hover:text-heading">
              <Link href="/">Home</Link>
            </li>
            <li className="text-base text-body mt-0.5">/</li>
            <li className="text-sm text-body px-2.5 transition duration-200 ease-in first:pl-0 last:pr-0 hover:text-heading">
              <Link href="/products" className="capitalize">products</Link>
            </li>
            <li className="text-base text-body mt-0.5">/</li>
            <li className="text-sm text-body px-2.5 transition duration-200 ease-in first:pl-0 last:pr-0 hover:text-heading">
              <Link href={`/products/${product.handle}`} className="capitalize">
                {product.title.toLowerCase()}
              </Link>
            </li>
          </ol>
        </div>
      </div>

      <div className="items-start block grid-cols-9 lg:grid gap-x-10 xl:gap-x-14 pt-10">
        <div className="col-span-5">
          <ImageGallery images={product.images || []} />
        </div>
        <div className="col-span-4 pt-8 lg:pt-0">
          <div className="pb-7 mb-7 border-b border-gray-300">
            <ProductInfo product={productForInfo} />
            <p className="text-body text-center mt-8 text-base lg:text-base leading-6 lg:leading-8">
              FREE SHIPPING & EASY RETURNS
            </p>
          </div>
          <div className="flex items-center py-8 space-x-4 border-b border-gray-300 rtl:md:pl-32 rtl:lg:pl-12 rtl:2xl:pl-32 rtl:3xl:pl-48">
            <Suspense
              fallback={<ProductActions disabled product={product} region={region} />}
            >
              <ProductActionsWrapper product={product} region={region} />
            </Suspense>
            <ProductOnboardingCta />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-9 gap-x-10 xl:gap-x-14 pt-10 pb-10 lg:pb-14 2xl:pb-20 items-start">
        <div className="col-span-5 order-2 lg:order-1">
          <div className="pb-7 mb-7 pt-7 md:pt-0 border-b border-gray-300">
            <button
              className="relative inline-flex items-center justify-between w-full font-semibold text-heading text-lg"
              onClick={toggleSpecifications}
            >
              Specifications
              {isSpecificationOpen ? <FaChevronUp className="text-base" /> : <FaChevronDown className="text-base" />}
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
        </div>

        <div className="col-span-5 md:col-span-4 pt-8 lg:pt-0 order-1 lg:order-2">
          <div className="pb-7 mb-7 border-b border-gray-300">
            <button
              className="relative inline-flex items-center justify-between w-full font-semibold text-heading text-lg"
              onClick={toggleDescription}
            >
              Description
              {isDescriptionOpen ? <FaChevronUp className="text-base" /> : <FaChevronDown className="text-base" />}
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
              <div className="desc-pdp my-5 text-body text-sm lg:text-base leading-6 lg:leading-8 font-normal [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-5 [&_ul>li]:mb-2 [&_strong]:font-semibold">
                {!subtitleHasBlocks && product.subtitle != null && (
                  <div className="font-semibold mb-2">{product.subtitle}</div>
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(combinedDescHtml) }}
                />
              </div>
            </TransitionWrapper>
          </Transition>
        </div>
      </div>

      <div className="content-container my-16 small:my-32" data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} region={region} countryCode={countryCode} relatedProducts={relatedProducts} />
        </Suspense>
      </div>
    </div>
  );
};

export default ProductTemplate;