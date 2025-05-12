// src/lib/locals.ts
export interface LanguageMenuItem {
    id: string;
    value: string;
    name: string;
    icon: string;
    iconMobile: string;
  }
  
  const languageMenu = [
    {
      id: "en",
      value: "en",
      name: "English",
      icon: "FlagEn",
      iconMobile: "FlagEn",
    },
    {
      id: "ar",
      value: "ar",
      name: "Arabic",
      icon: "FlagAr",
      iconMobile: "FlagAr",
    },
  ] as LanguageMenuItem[];
  
  export { languageMenu };