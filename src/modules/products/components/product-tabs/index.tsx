"use client";

import React from "react";
import { HttpTypes } from "@medusajs/types";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type ProductTabsProps = {
  product: HttpTypes.StoreProduct & {
    metadata?: {
      materials?: string | null;
      style?: string | null;
      origin?: string | null;
      season?: string | null;
      gender?: string | null;
      brand?: string | null;
    };
  };
};

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const { t } = useTranslation("common");
  const md = product.metadata || {};

  const fields: [string, string | null | undefined][] = [
    [t("text-materials"), md.materials],
    [t("text-style"), md.style],
    [t("text-origin"), md.origin],
    [t("text-season"), md.season],
    [t("text-gender"), md.gender],
    [t("text-brand"), md.brand],
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
              {label === t("text-brand") ? (
                <Link
                  href={`/brands/${value.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-right transition hover:underline hover:text-heading"
                >
                  {value}
                </Link>
              ) : (
                <span className="text-right">{value}</span>
              )}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default ProductTabs;
