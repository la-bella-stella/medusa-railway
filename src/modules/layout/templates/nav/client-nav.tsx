"use client";

import React from "react";
import { StoreRegion, HttpTypes } from "@medusajs/types";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

export interface ClientNavProps {
  regions: StoreRegion[];
  isAuthenticated: boolean;
  cart: HttpTypes.StoreCart | null;
  regionId: string;
}

export default function ClientNav(props: ClientNavProps) {
  return (
    <>
      <DesktopNav {...props} />
      <MobileNav {...props} />
      {/* CartOverlay and any shared overlays can remain here */}
    </>
  );
}