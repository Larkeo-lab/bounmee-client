// Components
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Wifi, WifiHigh, WifiLow, WifiOff } from "lucide-react";
import clsx from "clsx";

import ProfileDropdown from "./profile-dropdown";
import LanguageSwitch from "./common/language-switch";

import { siteConfig } from "@/config/site";
import { SearchIcon } from "@/components/icons";
import { useCart } from "@/provider";

export const Navbar = () => {
  const { isConnected, rtt } = useCart();

  const WifiSignal = () => {
    if (!isConnected)
      return <WifiOff className="text-danger animate-pulse" size={16} />;

    // Determine icon based on strength
    let Icon = Wifi;
    let textColor = "text-success";
    let shadowColor = "rgba(23,201,100,0.6)";

    if (rtt !== null) {
      if (rtt >= 400) {
        Icon = WifiLow;
        textColor = "text-danger";
        shadowColor = "rgba(243,18,96,0.6)";
      } else if (rtt >= 150) {
        Icon = WifiHigh;
        textColor = "text-success";
        shadowColor = "rgba(23,201,100,0.6)";
      }
    }

    return (
      <Icon
        className={clsx(
          textColor,
          `drop-shadow-[0_0_3px_${shadowColor}] transition-all duration-500`,
        )}
        size={16}
      />
    );
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar
      className="py-0 border-b border-b-default-200"
      maxWidth="full"
      position="sticky"
    >
      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex items-center gap-4">
          {/* status online and offline */}
          <div
            className={clsx(
              "flex items-center justify-center px-2.5 py-1.5 rounded-full border shadow-sm transition-all duration-300",
              isConnected
                ? "bg-success/5 border-success/10"
                : "bg-danger/5 border-danger/10",
            )}
          >
            <WifiSignal />
          </div>
          <LanguageSwitch />
          <ProfileDropdown />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
