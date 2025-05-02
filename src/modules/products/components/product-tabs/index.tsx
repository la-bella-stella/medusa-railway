"use client";

import React from "react";
import { HttpTypes } from "@medusajs/types";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type ProductTabsProps = {
  product: HttpTypes.StoreProduct & {
    brand?: { name: string; handle: string };
    type?: HttpTypes.StoreProductType | null;
    handle: string;
    subtitle: string | null;
    description: string | null;
    material: string | null;
    origin_country: string | null;
    metadata?: {
      materials?: string | string[] | null;
      style?: string | null;
      origin?: string | null;
      season?: string | null;
      gender?: string | null;
      size_code?: string | null;
      hs_code?: string | null;
    };
  };
};

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const { t } = useTranslation("common");
  const md = product.metadata || {};

  // Helper to normalize material values
  const normalizeMaterial = (value: string): string => {
    if (!value) return "";
    // Handle cases like "100%DEER LEATHER" → "100% Deer Leather"
    return value
      .replace(/100%(\w+)/g, (match, p1) => `100% ${p1}`)
      .replace(/\b(\w+)/g, (match) =>
        match.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
      )
      .trim();
  };

  // Helper to format field values, handling arrays and special characters
  const formatValue = (value: string | string[] | null | undefined, isMaterials: boolean = false): string => {
    if (!value) return "";
    const result = Array.isArray(value)
      ? value
          .map((v) => (isMaterials ? normalizeMaterial(v || "") : v || ""))
          .filter(Boolean)
          .join(", ")
      : isMaterials
      ? normalizeMaterial(value || "")
      : value || "";
    console.log(`formatValue: input=${JSON.stringify(value)}, isMaterials=${isMaterials}, output=${result}`);
    return result;
  };

  const fields: [string, string | string[] | null | undefined][] = [
    [t("text-materials"), md.materials || product.material],
    [t("text-style"), md.style],
    [t("text-origin"), md.origin || product.origin_country],
    [t("text-season"), md.season],
    [t("text-gender"), md.gender],
    [t("text-size"), md.size_code],
    [t("text-hs-code"), md.hs_code],
    [t("text-brand"), product.brand?.name],
  ];

  return (
    <div className="flex flex-col">
      <ul className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
        {fields.map(([label, value], idx) =>
          value ? (
            <li key={idx} className="flex justify-between py-3">
              <span className="font-semibold text-heading uppercase">
                {label}
              </span>
              {label === t("text-brand") && product.brand?.handle ? (
                <Link
                  href={`/brands/${encodeURIComponent(product.brand.handle)}`}
                  className="text-right transition hover:underline hover:text-heading"
                >
                  {formatValue(value)}
                </Link>
              ) : (
                <span className="text-right text-gray-500">
                  {formatValue(value, label === t("text-materials"))}
                </span>
              )}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default ProductTabs;