import React from "react";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/react";
import { useHref, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./routes/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import SessionExpiredModal from "./components/common/SessionExpiredModal";

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <AuthProvider>
          <ChatProvider>
            {children}
            <Toaster position="top-right" />
            <SessionExpiredModal />
          </ChatProvider>
        </AuthProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
};
