"use client";

import React from "react";

interface ProductFeedLoaderProps {
  limit?: number;
  uniqueKey?: string;
}

const ProductFeedLoader: React.FC<ProductFeedLoaderProps> = ({
  limit = 20,
  uniqueKey = "product-feed",
}) => {
  return (
    <>
      {Array.from({ length: limit }).map((_, index) => (
        <div
          key={`${uniqueKey}-${index}`}
          className="animate-pulse bg-gray-200 rounded-md h-48"
        />
      ))}
    </>
  );
};

export default ProductFeedLoader;