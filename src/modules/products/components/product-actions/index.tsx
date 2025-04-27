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
import { useUI } from "@lib/context/ui-context";
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
  const countryCode = useParams().countryCode as string;
  const router = useRouter();
  const { openSidebar } = useUI();

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
      return;
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options);
      return isEqual(variantOptions, options);
    });
  }, [product.variants, options]);

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

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      });

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

      openSidebar({ view: "CART_SIDEBAR" });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error(t("error-adding-to-cart", "Failed to add item to cart"));
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
                (selectedVariant?.inventory_quantity !== undefined &&
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
              !isValidVariant
            }
            variant="primary"
            className={`w-full bg-black text-white py-2 rounded-full uppercase font-semibold text-xs tracking-wide transition-all duration-200 ${
              !inStock || !isValidVariant || !selectedVariant
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