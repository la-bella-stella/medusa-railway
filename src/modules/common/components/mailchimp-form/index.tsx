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
  className?: string;
}

const CustomForm: React.FC<CustomFormProps> = ({
  status,
  message,
  onValidated,
  layout,
  className,
}) => {
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
        "flex flex-row gap-2 w-full sm:w-96 md:w-[400px] z-10 relative items-center",
        layout === "newsletter" && "flex-col sm:flex-row pt-4 sm:pt-0",
        className
      )}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder-email-subscribe", { ns: "forms" })}
        className={cn(
          "flex-1 px-4 h-12 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400 text-sm bg-white",
          layout === "newsletter"
            ? "w-full text-center"
            : "text-center ltr:sm:text-left rtl:sm:text-right"
        )}
        required
        disabled={status === "sending"}
      />

      <Button
        className={cn(
          "h-12 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition text-sm font-medium",
          layout === "newsletter"
            ? "w-full sm:w-auto mt-2 sm:mt-0"
            : "ltr:sm:ml-2 rtl:sm:mr-2"
        )}
        disabled={status === "sending"}
      >
        {status === "sending"
          ? t("subscribe-sending", { ns: "forms" })
          : t("button-subscribe")}
      </Button>
    </form>
  );
};

interface MailchimpFormProps {
  layout: "subscribe" | "newsletter";
  className?: string;
}

const MailchimpForm: React.FC<MailchimpFormProps> = ({
  layout = "newsletter",
  className,
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
          className={className}
        />
      )}
    />
  );
};

export default MailchimpForm;