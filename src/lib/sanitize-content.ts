import { useEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";

interface SanitizeContentOptions {
  // Allow description to be string, undefined _or_ null
  description?: string | null;
}

export const useSanitizeContent = (
  { description }: SanitizeContentOptions
): string | undefined => {
  const [sanitizedContent, setSanitizedContent] =
    useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof description === "string") {
      const clean = sanitizeHtml(description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt"],
        },
      });
      setSanitizedContent(clean);
    } else {
      setSanitizedContent(undefined);
    }
  }, [description]);

  return sanitizedContent;
};
