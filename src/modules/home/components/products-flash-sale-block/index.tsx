// src/modules/home/components/products-flash-sale-block/index.tsx
import { StoreProduct, StoreRegion } from "@medusajs/types";

interface ProductsFlashSaleBlockProps {
  date: string;
  variant: "slider";
  region: StoreRegion;
}

const ProductsFlashSaleBlock: React.FC<ProductsFlashSaleBlockProps> = ({ date, variant, region }) => {
  return <div>Flash Sale Placeholder (Date: {date}, Variant: {variant})</div>;
};

export default ProductsFlashSaleBlock;