"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { addToCart } from "@lib/data/cart";
import { useIntersection } from "@lib/hooks/use-in-view";
import { HttpTypes } from "@medusajs/types";
import { Button } from "@medusajs/ui";
import Divider from "@modules/common/components/divider";
import { isEqual } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useWindowSize from "react-use/lib/useWindowSize";
import { useUI } from "@lib/context/ui-context";
import { getProductPrice } from "@lib/util/get-product-price";
import OptionSelect from "./option-select";

type ProductActionsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  disabled?: boolean;
  onVariantChange?: (variant: HttpTypes.StoreProductVariant | undefined) => void;
};

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value;
    return acc;
  }, {});
};

export default function ProductActions({
  product,
  region,
  disabled,
  onVariantChange,
}: ProductActionsProps) {
  const { t } = useTranslation("common");
  const { width } = useWindowSize();
  const params = useParams();
  const countryCodeParam = params.countryCode as string | undefined;
  const router = useRouter();
  const { openSidebar } = useUI();

  // Fallback to region's first country or a default code if countryCode is missing
  const countryCode = useMemo(() => {
    if (countryCodeParam) return countryCodeParam;
    const defaultCountry = region?.countries?.[0]?.iso_2 || "us";
    console.log("Using fallback countryCode:", defaultCountry);
    return defaultCountry;
  }, [countryCodeParam, region]);

  const [options, setOptions] = useState<Record<string, string | undefined>>(() => {
    const initialOptions: Record<string, string | undefined> = {};
    product.options?.forEach((option) => {
      if (option.values && option.values.length > 0) {
        initialOptions[option.id] = option.values[0].value;
      }
    });
    return initialOptions;
  });

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options);
      setOptions(variantOptions ?? {});
    }
  }, [product.variants]);

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined;
    }

    const variant = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options);
      return isEqual(variantOptions, options);
    });

    console.log("Selected variant:", {
      variantId: variant?.id,
      title: variant?.title,
      options,
      variantOptions: variant ? optionsAsKeymap(variant.options) : null,
      inventory_quantity: variant?.inventory_quantity,
      manage_inventory: variant?.manage_inventory,
      allow_backorder: variant?.allow_backorder,
      prices: variant?.prices,
    });

    return variant;
  }, [product.variants, options]);

  useEffect(() => {
    onVariantChange?.(selectedVariant);
  }, [selectedVariant, onVariantChange]);

  // Log inventory, region, and variants for debugging
  useEffect(() => {
    console.log("ProductActions context:", {
      productId: product.id,
      title: product.title,
      variantId: selectedVariant?.id,
      inventory_quantity: selectedVariant?.inventory_quantity ?? "Not available",
      manage_inventory: selectedVariant?.manage_inventory,
      allow_backorder: selectedVariant?.allow_backorder,
      countryCode,
      regionId: region?.id,
      regionCurrency: region?.currency_code,
      regionCountries: region?.countries?.map((c) => c.iso_2),
      availableVariants: product.variants?.map((v) => ({
        id: v.id,
        title: v.title,
        inventory_quantity: v.inventory_quantity,
        prices: v.prices,
      })),
    });
  }, [product.id, product.title, product.variants, selectedVariant, countryCode, region]);

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options);
      return isEqual(variantOptions, options);
    }) ?? false;
  }, [product.variants, options]);

  const inStock = useMemo(() => {
    if (!selectedVariant) {
      return false;
    }
    if (!selectedVariant.manage_inventory || selectedVariant.allow_backorder) {
      return true;
    }
    return (
      selectedVariant.inventory_quantity != null &&
      selectedVariant.inventory_quantity > 0 &&
      selectedVariant.inventory_quantity >= quantity
    );
  }, [selectedVariant, quantity]);

  const hasValidPrice = useMemo(() => {
    if (!selectedVariant?.id) return false;
    const priceData = getProductPrice({ product, variantId: selectedVariant.id, region });
    console.log("Variant price check:", {
      variantId: selectedVariant.id,
      variantPrice: priceData.variantPrice,
      regionCurrency: region?.currency_code,
      prices: selectedVariant?.prices || [],
    });
    return !!priceData.variantPrice;
  }, [selectedVariant, product, region]);

  const actionsRef = useRef<HTMLDivElement>(null);
  const inView = useIntersection(actionsRef, "0px");

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || !isValidVariant) {
      toast.error(t("select-variant", "Please select a valid variant"));
      console.warn("Invalid variant selection:", { options, selectedVariant });
      return;
    }

    if (!inStock) {
      toast.error(t("out-of-stock", "Selected item is out of stock"));
      console.warn("Out of stock:", {
        variantId: selectedVariant.id,
        inventory_quantity: selectedVariant.inventory_quantity,
        quantity,
      });
      return;
    }

    if (!countryCode) {
      toast.error(t("error-country-code", "Unable to determine region"));
      console.error("Country code unavailable", {
        countryCodeParam,
        regionId: region?.id,
        regionCountries: region?.countries,
      });
      return;
    }

    if (quantity <= 0) {
      toast.error(t("invalid-quantity", "Quantity must be greater than 0"));
      console.warn("Invalid quantity:", { quantity });
      return;
    }

    if (!hasValidPrice) {
      toast.error(t("no-price", "Selected variant has no price defined"));
      console.warn("No price for variant:", {
        variantId: selectedVariant.id,
        prices: selectedVariant?.prices || [],
        regionCurrency: region?.currency_code,
        priceData: getProductPrice({ product, variantId: selectedVariant.id, region }),
      });
      return;
    }

    setIsAdding(true);

    try {
      console.log("Calling addToCart with:", {
        variantId: selectedVariant.id,
        quantity,
        countryCode,
        regionId: region?.id,
      });

      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      });

      toast.success(t("add-to-cart", "Added to cart"), {
        theme: "dark",
        progressClassName: "fancy-progress-bar",
        position: width > 768 ? "bottom-left" : "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      openSidebar({ view: "CART_SIDEBAR" });
    } catch (error: any) {
      const errorMessage = error.message || t("error-adding-to-cart", "Failed to add item to cart");
      let userMessage = errorMessage;

      if (error.message?.includes("Variant")) {
        userMessage = t("variant-unavailable", "Selected variant is not available");
        if (error.message.includes("do not have a price")) {
          userMessage = t("no-price", "Selected variant has no price defined");
        }
      } else if (error.message?.includes("region")) {
        userMessage = t("invalid-region", "Selected region is not supported");
      } else if (error.message?.includes("Cart")) {
        userMessage = t("cart-error", "Error with cart, please try again");
      }

      toast.error(userMessage);
      console.error("Failed to add item to cart:", {
        errorMessage: error.message,
        errorDetails: {
          status: error.status,
          code: error.code,
          response: error.response?.data || error.response,
          type: error.type,
        },
        stack: error.stack,
        variantId: selectedVariant.id,
        quantity,
        countryCode,
        regionId: region?.id,
        productId: product.id,
        availableVariants: product.variants?.map((v) => v.id),
        prices: selectedVariant?.prices || [],
        regionCurrency: region?.currency_code,
        priceData: getProductPrice({ product, variantId: selectedVariant.id, region }),
      });
    } finally {
      setIsAdding(false);
    }
  };

  const buttonClasses = `text-[13px] md:text-sm leading-4 inline-flex items-center transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none focus:bg-opacity-80 h-11 md:h-12 px-5 bg-heading text-white py-2 transform-none normal-case hover:text-white hover:bg-gray-600 hover:shadow-cart w-full md:w-6/12 xl:w-full ${
    !inStock || !isValidVariant || !selectedVariant || !hasValidPrice || disabled || isAdding
      ? "bg-opacity-50 hover:bg-opacity-50 cursor-not-allowed hover:cursor-not-allowed"
      : ""
  }`;

  return (
    <div className="flex flex-col gap-y-2" ref={actionsRef}>
      <div className="pb-3 border-b border-gray-300 pt-7">
        {(product.variants?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-y-3">
            {(product.options || []).map((option) => (
              <OptionSelect
                key={option.id}
                option={option}
                current={options[option.id]}
                updateOption={setOptionValue}
                title={option.title || ""}
                disabled={!!disabled || isAdding}
                data-testid={`option-${option.id}`}
              />
            ))}
            <Divider />
          </div>
        )}
      </div>
      <div className="flex items-center py-8 space-x-4 border-b border-gray-300 rtl:md:pl-32 rtl:lg:pl-12 rtl:2xl:pl-32 rtl:3xl:pl-48">
        {(product.variants?.length === 0 || selectedVariant) && (
          <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border h-11 md:h-12 border-gray-300">
            <button
              className="flex items-center justify-center flex-shrink-0 h-full transition ease-in-out duration-300 focus:outline-none w-10 md:w-12 text-heading ltr:border-r rtl:border-l border-gray-300 hover:text-white hover:bg-heading"
              onClick={() => setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))}
              disabled={quantity === 1 || !inStock || disabled || isAdding}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12px"
                height="2px"
                viewBox="0 0 12 1.5"
              >
                <rect
                  data-name="Rectangle 970"
                  width="12px"
                  height="2px"
                  fill="currentColor"
                />
              </svg>
            </button>
            <span className="font-semibold flex items-center justify-center h-full transition-colors duration-250 ease-in-out cursor-default flex-shrink-0 text-base text-heading w-12 md:w-20 xl:w-24">
              {quantity}
            </span>
            <button
              className="flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-10 md:w-12 text-heading ltr:border-l rtl:border-r border-gray-300 hover:text-white hover:bg-heading"
              onClick={() => setQuantity((prev) => prev + 1)}
              disabled={
                !inStock ||
                (selectedVariant?.inventory_quantity != null &&
                  quantity >= selectedVariant.inventory_quantity) ||
                disabled ||
                isAdding
              }
            >
              <svg
                data-name="plus (2)"
                xmlns="http://www.w3.org/2000/svg"
                width="12px"
                height="12px"
                viewBox="0 0 12 12"
              >
                <g data-name="Group 5367">
                  <path
                    data-name="Path 17138"
                    d="M6.749,5.251V0h-1.5V5.251H0v1.5H5.251V12h1.5V6.749H12v-1.5Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </button>
          </div>
        )}
        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant ||
            !hasValidPrice
          }
          className={buttonClasses}
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          <span className="py-2">
            {!selectedVariant && !Object.keys(options).length
              ? t("select-variant", "Select variant")
              : !inStock || !isValidVariant
              ? t("out-of-stock", "Out of stock")
              : !hasValidPrice
              ? t("no-price", "No price available")
              : t("text-add-to-cart", "Add to cart")}
          </span>
        </Button>
      </div>
    </div>
  );
}