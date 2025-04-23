// src/lib/data/banners.ts
export interface Banner {
    id: number;
    slug: string;
    image: {
      mobile: { url: string };
      desktop: { url: string };
    };
    title: string;
  }
  
  export const saleBannerGrid: Banner[] = [
    {
      id: 1,
      slug: "spring-sale",
      image: {
        mobile: { url: "/images/banners/spring-sale-mobile.jpg" },
        desktop: { url: "/images/banners/spring-sale-desktop.jpg" },
      },
      title: "Spring Sale - Up to 30% Off",
    },
    {
      id: 2,
      slug: "summer-collection",
      image: {
        mobile: { url: "/images/banners/summer-collection-mobile.jpg" },
        desktop: { url: "/images/banners/summer-collection-desktop.jpg" },
      },
      title: "New Summer Collection",
    },
    {
      id: 3,
      slug: "clearance",
      image: {
        mobile: { url: "/images/banners/clearance-mobile.jpg" },
        desktop: { url: "/images/banners/clearance-desktop.jpg" },
      },
      title: "Clearance Sale",
    },
    {
      id: 4,
      slug: "holiday-deals",
      image: {
        mobile: { url: "/images/banners/holiday-deals-mobile.jpg" },
        desktop: { url: "/images/banners/holiday-deals-desktop.jpg" },
      },
      title: "Holiday Deals - Save Big",
    },
  ];