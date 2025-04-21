// src/modules/home/components/popular-collection-block/index.tsx
import { StoreCollection } from "@medusajs/types";
import HomeSectionHeader from "@modules/home/components/home-section-header";
import HomeCollectionCard from "@modules/home/components/collection-home-card";

interface Props {
  collections: StoreCollection[];
  className?: string;
  variant?: "default" | "modern" | "trendy" | "full";
  sectionHeading?: string;
  layout?: "cols-2" | "cols-4";
}

const PopularCollectionBlock: React.FC<Props> = ({
  collections = [],
  className = "mb-12 md:mb-14 xl:mb-16 lg:pt-1 xl:pt-0",
  variant = "default",
  sectionHeading,
  layout = "cols-2",
}) => {
  const layoutClass =
    layout === "cols-4"
      ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <div>
      {sectionHeading && <HomeSectionHeader sectionHeading={sectionHeading} />}

      <div className={`grid ${layoutClass} gap-5 xl:gap-7 ${className}`}>
        {collections.map((item) => (
          <HomeCollectionCard
            key={item.id}
            collection={item}
            variant={variant}
            imgHeight={variant === "trendy" ? 680 : 580}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularCollectionBlock;