// src/modules/home/components/popular-collection-block/index.tsx
"use client";

import HomeSectionHeader from "@modules/home/components/home-section-header";
import HomeCollectionCard from "@modules/home/components/collection-home-card";

// Static vs. Medusa collection item types
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

// Normalized shape for HomeCollectionCard
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
  // Two-col on small, four-col on large if layout=cols-4
  const layoutClass =
    layout === "cols-4"
      ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2";
  const isCols4 = layout === "cols-4";

  // Normalize incoming data for the card component
  const normalizedData: NormalizedCollectionItem[] = data.map((item) =>
    "slug" in item
      ? {
          slug: item.slug,
          image: item.image,
          title: item.title,
          description: item.description,
        }
      : {
          slug: item.handle,
          image: item.thumbnail ?? "/assets/placeholder/collection.svg",
          title: item.title,
          description: item.metadata?.description ?? "",
        }
  );

  return (
    <div>
      {sectionHeading && <HomeSectionHeader sectionHeading={sectionHeading} />}

      <div className={`grid ${layoutClass} gap-5 xl:gap-7 ${className}`}>
        {normalizedData.map((item, index) => (
          <div
            key={index}
            // force each card to sit in a 372px-wide box when in 4-col mode
            className={isCols4 ? "w-[372px] mx-auto" : ""}
          >
            <HomeCollectionCard
              collection={item}
              variant={variant}
              // use exact 372×496 px on desktop four-col
              imgWidth={isCols4 ? 372 : 580}
              imgHeight={isCols4 ? 496 : 580}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCollectionBlock;
