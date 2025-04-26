"use client";

import React from "react";
import { useTranslation } from "react-i18next";

interface NotFoundProps {
  text: string;
}

const NotFound: React.FC<NotFoundProps> = ({ text }) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">{text}</h2>
        <p className="mt-2 text-gray-600">{t("text-try-different-search", "Try a different search.")}</p>
      </div>
    </div>
  );
};

export default NotFound;