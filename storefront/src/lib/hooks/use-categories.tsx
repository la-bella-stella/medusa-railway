"use client";

import { useQuery } from "@tanstack/react-query";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";

interface Category {
  id: string;
  name: string;
  handle: string;
  productCount: number;
}

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const next = await getCacheOptions("categories");

      const response = await sdk.client.fetch<{
        product_categories: Category[];
      }>("/store/product-categories", {
        method: "GET",
        headers,
        next,
      });

      console.log("Fetched categories:", response.product_categories);

      // Fetch product counts for each category
      const categoriesWithCounts = await Promise.all(
        response.product_categories.map(async (category) => {
          const productResponse = await sdk.client.fetch<{
            products: { id: string }[];
            count: number;
          }>("/store/products", {
            method: "GET",
            query: {
              category_id: [category.id],
              fields: "id",
            },
            headers,
            next,
          });

          console.log(`Category ${category.name} (ID: ${category.id}, Handle: ${category.handle}) has ${productResponse.count} products`);

          return {
            ...category,
            productCount: productResponse.count,
          };
        })
      );

      return categoriesWithCounts;
    },
  });
};