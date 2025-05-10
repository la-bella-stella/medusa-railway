"use client";

import HomeSectionHeader from "@modules/home/components/home-section-header";
import HomeCollectionCard from "@modules/home/components/collection-home-card";

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

interface NormalizedCollectionItem {
  id: string | number;
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

  const normalizedData: NormalizedCollectionItem[] = data.map((item) =>
    "slug" in item
      ? {
          id: item.id,
          slug: item.slug,
          image: item.image,
          title: item.title,
          description: item.description,
        }
      : {
          id: item.id,
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
        {normalizedData.map((item) => (
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
