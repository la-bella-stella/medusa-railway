import Thumbnail from "@modules/products/components/thumbnail";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";

export type ProductHit = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  variants: HttpTypes.StoreProductVariant[];
  collection_handle: string | null;
  collection_id: string | null;
};

type HitProps = {
  hit: ProductHit;
};

const Hit = ({ hit }: HitProps) => {
  return (
    <LocalizedClientLink
      href={`/products/${hit.handle}`}
      data-testid="search-result"
      className="flex items-center gap-3 hover:bg-gray-100 rounded-md p-2 transition-colors"
    >
      {hit.thumbnail ? (
        <img
          src={hit.thumbnail}
          alt={hit.title}
          className="h-10 w-10 object-cover rounded"
        />
      ) : (
        <div className="h-10 w-10 bg-gray-200 rounded" />
      )}
      <span
        className="text-sm text-gray-700"
        data-testid="search-result-title"
      >
        {hit.title}
      </span>
    </LocalizedClientLink>
  );
};

export default Hit;
