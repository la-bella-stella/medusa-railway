// src/modules/products/components/product-tabs.tsx
"use client";

import React from "react";
import { HttpTypes } from "@medusajs/types";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type ProductTabsProps = {
  product: HttpTypes.StoreProduct & {
    brand?: { name: string };
    type?: HttpTypes.StoreProductType | null;
  };
};

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col">
      <ul className="text-sm text-gray-700 divide-y divide-gray-200 border-t border-b border-gray-200">
        {product.material && (
          <li className="flex justify-between py-3">
            <span className="font-semibold text-heading uppercase">{t("text-materials")}</span>
            <span className="text-right">{product.material}</span>
          </li>
        )}
        {product.type?.value && (
          <li className="flex justify-between py-3">
            <span className="font-semibold text-heading uppercase">{t("text-style")}</span>
            <span className="text-right">{product.type.value}</span>
          </li>
        )}
        {product.origin_country && (
          <li className="flex justify-between py-3">
            <span className="font-semibold text-heading uppercase">{t("text-origin")}</span>
            <span className="text-right">{product.origin_country}</span>
          </li>
        )}
        <li className="flex justify-between py-3">
          <span className="font-semibold text-heading uppercase">{t("text-season")}</span>
          <span className="text-right">SS23</span>
        </li>
        <li className="flex justify-between py-3">
          <span className="font-semibold text-heading uppercase">{t("text-gender")}</span>
          <span className="text-right">Male</span>
        </li>
        {product.brand?.name && (
          <li className="flex justify-between py-3">
            <span className="font-semibold text-heading uppercase">{t("text-brand")}</span>
            <Link
              href={`/brands/${product.brand.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-right transition hover:underline hover:text-heading"
            >
              {product.brand.name}
            </Link>
          </li>
        )}
        {product.weight && (
          <li className="flex justify-between py-3">
            <span className="font-semibold text-heading uppercase">{t("text-weight")}</span>
            <span className="text-right">{`${product.weight} g`}</span>
          </li>
        )}
        {(product.length || product.width || product.height) && (
          <li className="flex justify-between py-3">
            <span className="font-semibold text-heading uppercase">{t("text-dimensions")}</span>
            <span className="text-right">
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ProductTabs;