"use client"; // Mark this as a client component

import { NextUIProvider } from "@nextui-org/react";
import { ReactNode } from "react";

export default function NextUIProviderWrapper({ children }: { children: ReactNode }) {
  return <NextUIProvider>{children}</NextUIProvider>;
}