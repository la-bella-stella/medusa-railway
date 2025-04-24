// src/modules/common/components/subscription/mailchimp-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { atom, useAtom } from "jotai";
import cn from "classnames";
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { Button } from "@medusajs/ui";

export const subscribeAtomSuccessfully = atom(false);

interface CustomFormProps {
  status: "error" | "sending" | "success" | null;
  message: string | Error | null;
  onValidated: any;
  layout: "subscribe" | "newsletter";
}

const CustomForm: React.FC<CustomFormProps> = ({
  status,
  message,
  onValidated,
  layout,
}) => {
  // we only need the 'common' namespace here; we'll pull the placeholder from 'forms'
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [, setSuccessMessage] = useAtom(subscribeAtomSuccessfully);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidated({ EMAIL: email });
    setEmail("");
  };

  useEffect(() => {
    setSuccessMessage(status === "success");
  }, [status, setSuccessMessage]);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-row gap-2 w-full sm:w-96 md:w-[545px] z-10 relative items-center",
        layout === "newsletter" && "pt-8 sm:pt-10 md:pt-14 mb-1 sm:mb-0"
      )}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        /* pull placeholder from the 'forms' namespace explicitly */
        placeholder={t("placeholder-email-subscribe", { ns: "forms" })}
        className={cn(
          "flex-1 px-4 lg:px-7 h-12 lg:h-14 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-center ltr:sm:text-left rtl:sm:text-right bg-white",
          layout === "newsletter" && "text-center bg-gray-50"
        )}
        required
        disabled={status === "sending"}
      />

      <Button
        className={cn(
          "px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition w-auto",
          layout === "newsletter"
            ? "w-full h-12 lg:h-14 mt-3 sm:mt-4"
            : "ltr:sm:ml-2 rtl:sm:mr-2 md:h-full flex-shrink-0"
        )}
        disabled={status === "sending"}
      >
        <span className={layout === "newsletter" ? "lg:py-0.5" : "lg:py-0.5"}>
          {status === "sending"
            /* subscribe-sending lives in forms.json */
            ? t("subscribe-sending", { ns: "forms" })
            /* button-subscribe lives in common.json */
            : t("button-subscribe")}
        </span>
      </Button>
    </form>
  );
};

interface MailchimpFormProps {
  layout: "subscribe" | "newsletter";
}

const MailchimpForm: React.FC<MailchimpFormProps> = ({
  layout = "newsletter",
}) => {
  const url = process.env.NEXT_PUBLIC_MAILCHIMP_URL as string;

  return (
    <MailchimpSubscribe
      url={url}
      render={({ subscribe, status, message }) => (
        <CustomForm
          status={status}
          message={message}
          layout={layout}
          onValidated={(formData: any) => subscribe(formData)}
        />
      )}
    />
  );
};

export default MailchimpForm;
