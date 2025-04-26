// src/app/ClientWrapper.tsx
"use client";

import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UIProvider } from "@lib/context/ui-context";

const queryClient = new QueryClient();

interface ClientWrapperProps {
  children: ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <UIProvider>{children}</UIProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default ClientWrapper;