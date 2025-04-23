"use client";

import { useEffect, RefObject } from "react";

// Custom hook to add scroll behavior
export function useActiveScroll<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  topOffset: number = 0
) {
  useEffect(() => {
    const element = ref?.current;
    if (!element) return; // Early return if ref is null

    const listener = () => {
      if (window.scrollY > topOffset) {
        element.classList.add("is-scrolling");
      } else {
        element.classList.remove("is-scrolling");
      }
    };

    document.addEventListener("scroll", listener);
    return () => {
      document.removeEventListener("scroll", listener);
    };
  }, [ref, topOffset]);
}