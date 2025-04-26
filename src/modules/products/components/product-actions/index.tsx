// src/modules/products/components/product-actions.tsx
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

type ProductActionsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  disabled?: boolean;
  onVariantChange?: (variant: HttpTypes.StoreProductVariant | undefined) => void; // Add callback to notify parent of variant changes
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
  const countryCode = useParams().countryCode as string;
  const router = useRouter();
  const [options, setOptions] = useState<Record<string, string | undefined>>({});
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
      return;
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options);
      return isEqual(variantOptions, options);
    });
  }, [product.variants, options]);

  // Notify parent of variant change
  useEffect(() => {
    onVariantChange?.(selectedVariant);
  }, [selectedVariant, onVariantChange]);

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
    });
  }, [product.variants, options]);

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true;
    }

    if (selectedVariant?.allow_backorder) {
      return true;
    }

    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true;
    }

    return false;
  }, [selectedVariant]);

  const actionsRef = useRef<HTMLDivElement>(null);
  const inView = useIntersection(actionsRef, "0px");

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;

    setIsAdding(true);

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity,
      countryCode,
    });

    setIsAdding(false);

    router.refresh();

    toast(t("add-to-cart"), {
      theme: "dark",
      progressClassName: "fancy-progress-bar",
      position: width > 768 ? "bottom-left" : "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-y-4 pb-3 border-b border-gray-300 pt-7">
              {(product.options || []).map((option) => {
                const isColor = option.title?.toLowerCase().includes("color");
                return (
                  <div key={option.id}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {option.title}
                    </label>
                    <div className="flex space-x-2">
                      {option.values?.map((value) => (
                        <button
                          key={value.id}
                          onClick={() =>
                            setOptionValue(option.id, value.value || "")
                          }
                          className={`transition-all duration-200 ${
                            isColor
                              ? `w-8 h-8 border-2 rounded-sm ${
                                  options[option.id] === value.value
                                    ? "border-black"
                                    : "border-gray-300"
                                } hover:border-black hover:scale-105`
                              : `px-4 py-2 border-2 rounded-sm font-semibold text-sm ${
                                  options[option.id] === value.value
                                    ? "border-black bg-gray-100 text-black"
                                    : "border-gray-300 text-gray-700"
                                } hover:border-black hover:bg-gray-50`
                          }`}
                          style={
                            isColor
                              ? { backgroundColor: value.value?.toLowerCase() }
                              : {}
                          }
                          disabled={!!disabled || isAdding}
                          data-testid={`option-${option.id}-${value.value}`}
                        >
                          {isColor ? "" : value.value}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <Divider />
            </div>
          )}
        </div>

        <div className="flex items-center py-8 space-x-4 border-b border-gray-300 rtl:md:pl-32 rtl:lg:pl-12 rtl:2xl:pl-32 rtl:3xl:pl-48">
          <Counter
            quantity={quantity}
            onIncrement={() => setQuantity((prev) => prev + 1)}
            onDecrement={() =>
              setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
            }
            disableDecrement={quantity === 1 || !inStock}
            disableIncrement={
              !inStock ||
              (selectedVariant?.inventory_quantity !== undefined &&
                quantity >= selectedVariant.inventory_quantity)
            }
          />
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className={`w-full bg-black text-white py-3 rounded-md uppercase font-semibold text-sm tracking-wide transition-all duration-200 ${
              !inStock || !isValidVariant || !selectedVariant
                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                : "hover:bg-gray-900"
            }`}
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            <span className="py-2">
              {!selectedVariant && !Object.keys(options).length
                ? t("select-variant", "Select variant")
                : !inStock || !isValidVariant
                ? t("out-of-stock", "Out of stock")
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