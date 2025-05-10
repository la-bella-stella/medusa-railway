// src/lib/util/get-direction.ts
export function getDirection(locale: string | undefined): "ltr" | "rtl" {
    const rtlLocales = ["ar", "he"];
    return rtlLocales.includes(locale || "") ? "rtl" : "ltr";
  }