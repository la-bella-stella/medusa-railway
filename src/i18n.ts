// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

// Preload translations for server-side rendering
const enCommon = require("../public/locales/en/common.json");

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      console.log(`Loading translations for ${language}/${namespace}`);
      return import(`../public/locales/${language}/${namespace}.json`);
    })
  )
  .init({
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    ns: ["common", "forms", "menu"],
    defaultNS: "common",
    debug: true,
    react: {
      useSuspense: false,
    },
    resources: {
      en: {
        common: enCommon,
      },
    },
  });

console.log("i18next initialized successfully");

export default i18n;