// src/modules/common/components/loaders/product-card-grid-loader/index.tsx
import React from "react";
import cn from "classnames";

interface ProductCardGridLoaderProps {
  uniqueKey: string;
  variant?: "grid" | "gridSlim" | "list" | "gridModern";
  className?: string;
}

const ProductCardGridLoader: React.FC<ProductCardGridLoaderProps> = ({
  uniqueKey,
  variant = "gridModern",
  className = "",
}) => {
  return (
    <div
      key={uniqueKey}
      className={cn(
        "bg-gray-200 animate-pulse rounded-md overflow-hidden",
        {
          "w-[150px]": variant === "gridSlim", // Adjust width for carousel (example)
          "w-[200px]": variant === "gridModern", // Example for grid layout
        },
        className
      )}
    >
      <div className="w-full aspect-[3/4] bg-gray-300" />
      <div className="px-3 py-3 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
        <div className="h-4 bg-gray-300 rounded w-1/4" />
      </div>
    </div>
  );
};

export default ProductCardGridLoader;