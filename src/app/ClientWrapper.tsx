// src/app/ClientWrapper.tsx
"use client";

import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // Import the configured i18n instance

interface ClientWrapperProps {
  children: ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default ClientWrapper;