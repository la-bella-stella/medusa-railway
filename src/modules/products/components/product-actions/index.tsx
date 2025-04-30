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
import Counter from "@modules/common/components/counter";
import MobileActions from "./mobile-actions";
import { useUI } from "@lib/context/ui-context";
import OptionSelect from "./option-select";
import { getProductPrice } from "@lib/util/get-product-price";

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
      // Log parameters before calling addToCart
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
      router.refresh();
    } catch (error: any) {
      // Parse Medusa error for specific messages
      const errorMessage = error.message || t("error-adding-to-cart", "Failed to add item to cart");
      let userMessage = errorMessage;

      // Handle common Medusa errors
      if (error.message?.includes("Variant")) {
        userMessage = t("variant-unavailable", "Selected variant is not available");
        if (error.message.includes("do not have a price")) {
          userMessage = t("no-price", "Selected variant has no price defined");
          // Suggest a refresh to handle potential data inconsistency
          router.refresh();
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

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-y-3 pb-2 border-b border-gray-200 pt-4">
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

        {/* Display inventory for testing */}
        <div className="text-sm text-gray-600 mb-3">
          <p>
            Inventory:{" "}
            {selectedVariant?.inventory_quantity != null
              ? selectedVariant.inventory_quantity
              : "Not available"}
          </p>
        </div>

        <div className="flex items-center py-3 space-x-2 border-b border-gray-200">
          {(product.variants?.length === 0 || selectedVariant) && (
            <Counter
              quantity={quantity}
              onIncrement={() => setQuantity((prev) => prev + 1)}
              onDecrement={() =>
                setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
              }
              disableDecrement={quantity === 1 || !inStock}
              disableIncrement={
                !inStock ||
                (selectedVariant?.inventory_quantity != null &&
                  quantity >= selectedVariant.inventory_quantity)
              }
            />
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
            variant="primary"
            className={`w-full bg-black text-white py-2 rounded-full uppercase font-semibold text-xs tracking-wide transition-all duration-200 ${
              !inStock || !isValidVariant || !selectedVariant || !hasValidPrice
                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                : "hover:bg-gray-900"
            }`}
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            <span className="py-1">
              {!selectedVariant && !Object.keys(options).length
                ? t("select-variant", "Select variant")
                : !inStock || !isValidVariant
                ? t("out-of-stock", "Out of stock")
                : !hasValidPrice
                ? t("no-price", "No price available")
                : t("add-to-cart", "Add to cart")}
            </span>
          </Button>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  );
}