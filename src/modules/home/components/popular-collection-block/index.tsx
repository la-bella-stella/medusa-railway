// src/modules/home/components/popular-collection-block/index.tsx
"use client";
import HomeSectionHeader from "@modules/home/components/home-section-header";
import HomeCollectionCard from "@modules/home/components/collection-home-card";

// Define types for both static and Medusa data
interface StaticCollectionItem {
  id: number;
  slug: string;
  image: string;
  title: string;
  description: string;
}

interface MedusaCollectionItem {
  id: string;
  handle: string;
  title: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

type CollectionItem = StaticCollectionItem | MedusaCollectionItem;

// Define the shape expected by HomeCollectionCard
interface NormalizedCollectionItem {
  slug: string;
  image: string;
  title: string;
  description?: string;
}

interface Props {
  data: CollectionItem[];
  className?: string;
  variant?: "default" | "modern" | "trendy" | "full";
  sectionHeading?: string;
  layout?: "cols-2" | "cols-4";
}

const PopularCollectionBlock: React.FC<Props> = ({
  data = [],
  className = "mb-12 md:mb-14 xl:mb-16 lg:pt-1 xl:pt-0",
  variant = "default",
  sectionHeading,
  layout = "cols-2",
}) => {
  const layoutClass =
    layout === "cols-4"
      ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2";
  const isCols4 = layout === "cols-4";

  // Normalize data to match HomeCollectionCard's expected shape
  const normalizedData: NormalizedCollectionItem[] = data.map((item) => {
    if ("slug" in item) {
      // StaticCollectionItem
      return {
        slug: item.slug,
        image: item.image,
        title: item.title,
        description: item.description,
      };
    } else {
      // MedusaCollectionItem
      return {
        slug: item.handle, // Map handle to slug
        image: item.thumbnail ?? "/assets/placeholder/collection.svg", // Map thumbnail to image, with fallback
        title: item.title,
        description: item.metadata?.description ?? "", // Use metadata for description, with fallback
      };
    }
  });

  return (
    <div>
      {sectionHeading && <HomeSectionHeader sectionHeading={sectionHeading} />}

      <div className={`grid ${layoutClass} gap-5 xl:gap-7 ${className}`}>
        {normalizedData.map((item, index) => (
          <HomeCollectionCard
            key={index}
            collection={item}
            variant={variant}
            imgWidth={isCols4 ? 680 : 580}
            imgHeight={isCols4 ? 680 : 580}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularCollectionBlock;