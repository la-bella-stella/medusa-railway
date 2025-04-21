// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`./public/locales/${language}/${namespace}.json`);
    })
  )
  .init({
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    ns: ["common", "menu"], // Namespaces to load
    defaultNS: "common", // Default namespace
  });

export default i18n;