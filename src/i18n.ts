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
    // We no longer hardcode `lng`; Next.js or your app layout
    // should call `i18n.changeLanguage(locale)` based on the current locale.
    fallbackLng: "en",
    debug: true,
    ns: ["common", "forms", "menu"],
    defaultNS: "common",
    supportedLngs: ["en", "fr", "es", "de", "zh"],  // list the locales you support
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // No `resources` here: everything loads via resourcesToBackend,
    // so you get the correct JSON for both "common" and "forms" (and "menu")
    // under whatever `lng` is active.
  });

export default i18n;
