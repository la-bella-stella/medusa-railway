// src/modules/common/components/subscription/index.tsx
"use client";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import Text from "@modules/common/components/text";
import MailchimpForm, { subscribeAtomSuccessfully } from "@modules/common/components/mailchimp-form";
import { getDirection } from "@lib/util/get-direction";

interface Props {
  className?: string;
  variant?: "default" | "modern";
}

const Subscription: React.FC<Props> = ({
  className = "px-5 sm:px-8 md:px-16 2xl:px-24",
  variant = "default",
}) => {
  const { t: tCommon } = useTranslation("common");
  const { t: tForms, i18n } = useTranslation("forms");
  const dir = getDirection(i18n.language);
  const [successMessage] = useAtom(subscribeAtomSuccessfully);

  const mailchimpSubscribeText = tForms("subscribe-success");

  return (
    <div
      className={cn(
        "relative flex flex-col lg:flex-row justify-center lg:justify-between items-center rounded-lg bg-gray-200 py-10 md:py-14 lg:py-16",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center lg:items-start -mt-1.5 lg:-mt-2 xl:-mt-0.5 text-center lg:text-left",
          variant === "default" ? "mb-7 md:mb-8 lg:mb-9 xl:mb-0" : "mb-7 z-10 relative"
        )}
      >
        <Text
          variant="mediumHeading"
          className="text-xl md:text-2xl lg:text-3xl xl:leading-10 font-bold mb-2 md:mb-2.5 lg:mb-3 xl:mb-3.5"
        >
          {tCommon("text-subscribe-heading")}
        </Text>
        <p className="text-body text-xs md:text-sm leading-6 md:leading-7 text-gray-600 mb-4">
          {tCommon("text-subscribe-description")}
        </p>
        {successMessage ? (
          <div
            className="rounded border-[1px] border-green-950 bg-green-50 px-4 py-3 text-heading"
            role="alert"
          >
            <div className="flex items-center justify-center">
              <div className="py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-6 w-6 fill-current text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold">{mailchimpSubscribeText}</p>
              </div>
            </div>
          </div>
        ) : (
          <MailchimpForm layout="subscribe" />
        )}
      </div>
      {variant === "modern" && (
        <div
          style={{
            backgroundImage:
              dir === "rtl"
                ? "url(/assets/images/subscription-bg-reverse.png)"
                : "url(/assets/images/subscription-bg.png)",
          }}
          className={cn(
            "hidden z-0 lg:block bg-no-repeat",
            dir === "rtl"
              ? "bg-left 2xl:-left-12 3xl:left-0"
              : "bg-right xl:-right-24 2xl:-right-20 3xl:right-0",
            "bg-contain xl:bg-cover 3xl:bg-contain absolute h-full w-full top-0"
          )}
        />
      )}
    </div>
  );
};

export default Subscription;