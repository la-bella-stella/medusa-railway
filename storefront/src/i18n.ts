// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((lng: string, ns: string) => {
      console.log(`Loading translations for ${lng}/${ns}`);
      return import(`../public/locales/${lng}/${ns}.json`);
    })
  )
  .init({
    fallbackLng: "en",
    debug: true,
    ns: ["common", "forms", "menu"],
    defaultNS: "common",
    supportedLngs: ["en", "fr", "es", "de", "zh"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true, // Enable Suspense
    },
  });

export default i18n;