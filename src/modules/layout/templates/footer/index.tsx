"use client"

import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FaFacebookF, FaInstagram } from "react-icons/fa"
import { useTranslation } from "react-i18next"

const footerDictionary = {
  about: "footer:about",
  aboutItems: [
    { key: "footer:about.media", href: "#" },
    { key: "footer:about.missionStatement", href: "#" },
    { key: "footer:about.customerSupport", href: "#" },
  ],
  information: "footer:information",
  informationItems: [
    { key: "footer:information.faq", href: "#" },
    { key: "footer:information.returnPolicy", href: "#" },
    { key: "footer:information.shippingPolicy", href: "#" },
    { key: "footer:information.privacyPolicy", href: "#" },
    { key: "footer:information.termsConditions", href: "#" },
    { key: "footer:information.paymentPolicy", href: "#" },
    { key: "footer:information.doNotSell", href: "#" },
    { key: "footer:information.authenticityGuarantee", href: "#" },
  ],
  followUs: "footer:followUs",
  followUsItems: [
    { key: "footer:followUs.facebook", href: "#", icon: "fb" },
    { key: "footer:followUs.instagram", href: "#", icon: "ig" },
  ],
  contact: "footer:contact",
  contactItems: [
    { key: "footer:contact.contactUs", href: "#" },
    { key: "footer:contact.website", href: "https://labellastella.com", value: "https://labellastella.com" },
  ],
  copyright: "footer:copyright",
  stripe: "footer:stripe",
}

export default function Footer() {
  const { t } = useTranslation('footer')

  return (
    <footer className="bg-black text-white pt-12 mt-12 border-t border-white/10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-14 pb-10">
          <div className="flex flex-col gap-y-2">
            <span className="text-sm font-semibold text-white mb-4">{t(footerDictionary.about)}</span>
            <ul className="grid grid-cols-1 gap-y-2 text-gray-300 text-sm">
              {footerDictionary.aboutItems.map((item, idx) => (
                <li key={idx}>
                  <LocalizedClientLink
                    className="hover:text-white"
                    href={item.href}
                  >
                    {t(item.key)}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm font-semibold text-white mb-4">{t(footerDictionary.information)}</span>
            <ul className="grid grid-cols-1 gap-y-2 text-gray-300 text-sm">
              {footerDictionary.informationItems.map((item, idx) => (
                <li key={idx}>
                  <LocalizedClientLink
                    className="hover:text-white"
                    href={item.href}
                  >
                    {t(item.key)}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm font-semibold text-white mb-4">{t(footerDictionary.followUs)}</span>
            <ul className="flex space-x-4">
              {footerDictionary.followUsItems.map((item, idx) => (
                <li key={idx}>
                  <LocalizedClientLink
                    className="hover:text-white"
                    href={item.href}
                  >
                    {item.icon === "fb" && <FaFacebookF className="text-gray-300 text-lg" />}
                    {item.icon === "ig" && <FaInstagram className="text-gray-300 text-lg" />}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm font-semibold text-white mb-4">{t(footerDictionary.contact)}</span>
            <ul className="grid grid-cols-1 gap-y-2 text-gray-300 text-sm">
              {footerDictionary.contactItems.map((item, idx) => (
                <li key={idx}>
                  <LocalizedClientLink
                    className="hover:text-white"
                    href={item.href}
                  >
                    {item.value ? `${t(item.key)} ${item.value}` : t(item.key)}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-5 pb-16">
          <div className="flex flex-col-reverse md:flex-row text-center md:justify-between">
            <Text className="text-gray-300 text-xs md:text-[13px] lg:text-sm leading-6">
              © {new Date().getFullYear()} {t(footerDictionary.copyright)}
            </Text>
            <div className="mb-2 md:mb-0">
              <span className="text-gray-300 text-sm">{t(footerDictionary.stripe)}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}