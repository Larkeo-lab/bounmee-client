import type { NavigateOptions } from "react-router-dom";
import { I18nProvider } from "@react-aria/i18n";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/routes";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider navigate={navigate} useHref={useHref} locale="en-GB">
        <AuthProvider>{children}</AuthProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
}
