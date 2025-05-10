"use client";

import React from "react";

interface StoreLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
}

export const StoreLayout: React.FC<StoreLayoutProps> = ({
  sidebar,
  mainContent,
}) => {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar (Filters) */}
      <div className="flex-shrink-0 hidden lg:block w-96">
        {sidebar}
      </div>

      {/* Main Content (Product Grid) */}
      <div className="w-full lg:pl-16">
        {mainContent}
      </div>
    </div>
  );
};

export default StoreLayout;