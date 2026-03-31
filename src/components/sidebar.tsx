import React, { useState, useEffect } from "react";

// Third-party imports
import { Link } from "@heroui/link";
import { Button, Image, Tooltip } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "@/routes/AuthContext";
import { Modal, ModalContent, ModalBody, ModalFooter } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

// Icons import
import {
  ShoppingCart,
  LayoutDashboard,
  Menu,
  X,
  ArrowRightToLine,
  ArrowLeftToLine,
  ChevronDown,
  ChevronRight,
  TriangleAlert,
  CornerDownRight,
  Settings,
  Receipt,
  LayoutGrid,
} from "lucide-react";

import deePosLogo from "/assets/logo.png";
const bgLineName = "/line-nam-bg.png";

import versionApp from "../../package.json";
import { getDisplayImageUrl } from "@/lib/utils";
import { useCart } from "@/provider";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  labelKey: string;
  href: string;
  icon?: any;
  children?: MenuItem[];
  badge?: number;
  permissionKey?: string;
}

interface MenuGroup {
  titleKey: string;
  items: MenuItem[];
}

const sidebarGroups: MenuGroup[] = [
  {
    titleKey: "sidebar.groups.menu",
    items: [
      {
        labelKey: "sidebar.menu.table",
        href: "/tables",
        icon: LayoutGrid,
        permissionKey: "table",
      },
      {
        labelKey: "sidebar.menu.pos",
        href: "/product-order",
        icon: ShoppingCart,
        permissionKey: "pos",
      },
      {
        labelKey: "sidebar.menu.statisticsReport",
        href: "/dashboard",
        icon: LayoutDashboard,
        permissionKey: "dashboard",
      },
      {
        labelKey: "sidebar.menu.order",
        href: "/order",
        icon: Receipt,
        permissionKey: "order",
      },
      {
        labelKey: "sidebar.menu.ordering",
        href: "/ordering",
        icon: Receipt,
        permissionKey: "ordering",
      },
    ],
  },
  {
    titleKey: "sidebar.groups.setting",
    items: [
      {
        labelKey: "sidebar.menu.setting",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { t } = useTranslation();
  const { useMemo } = React;
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isTokenExpired, user } = useAuth();
  const { carts, dismissedCarts } = useCart();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  // Calculate ordering badge
  const orderingBadge = useMemo(() => {
    return Object.entries(carts).filter(([tableId, items]) => {
      if (tableId === "default") return false;
      const itemsArr = items as any[];
      if (itemsArr.length === 0) return false;
      
      const lastSeenCount = dismissedCarts[tableId];
      if (lastSeenCount !== undefined && itemsArr.length <= lastSeenCount) {
        return false;
      }
      return true;
    }).length;
  }, [carts, dismissedCarts]);

  // Permission Logic
  const userRole = user?.user?.role;
  const userPermissions = user?.user?.employee?.permission?.permissions || {};

  const canAccess = (key?: string) => {
    if (!key) return true;
    if (userRole === "SUPER_ADMIN" || userRole === "STORE_ADMIN") return true;
    const modulePerms = userPermissions[key] as string[] | undefined;
    if (modulePerms && modulePerms.includes("read")) return true;
    return false;
  };

  const filteredGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.href === "/ordering") {
          return { ...item, badge: orderingBadge };
        }
        return item;
      }).filter((item) => canAccess(item.permissionKey)),
    }))
    .filter((group) => group.items.length > 0);

  // Session Expiry States
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(20);

  // Countdown logic for expiration modal
  useEffect(() => {
    let timer: any;
    if (isExpModalOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleLogout();
    }
    return () => clearInterval(timer);
  }, [isExpModalOpen, countdown]);

  const handleLogout = () => {
    setIsExpModalOpen(false);
    logout();
    navigate("/");
  };

  // Function to handle menu click with session validation
  const handleMenuClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // 1. Check if auth data exists in localStorage
    const authData = localStorage.getItem("authPOS");
    if (!authData) {
      e.preventDefault();
      logout();
      navigate("/");
      return;
    }

    // 2. Check if token is expired
    if (isTokenExpired()) {
      e.preventDefault();
      setCountdown(20);
      setIsExpModalOpen(true);
      return;
    }

    // 3. Mobile toggle
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  // Function to check if a menu item is active
  const isActiveRoute = (href: string) => {
    const currentPath = location.pathname;
    if (href === "/" && currentPath === "/") {
      return true;
    }
    if (href !== "/" && (currentPath === href || currentPath.startsWith(href + "/"))) {
      return true;
    }
    return false;
  };

  // Function to toggle submenu expansion
  const toggleSubmenu = (href: string) => {
    const newExpandedMenus = new Set(expandedMenus);
    if (newExpandedMenus.has(href)) {
      newExpandedMenus.delete(href);
    } else {
      newExpandedMenus.add(href);
    }
    setExpandedMenus(newExpandedMenus);
  };

  // Function to check if any child is active
  const hasActiveChild = (children: MenuItem[] | undefined) => {
    if (!children) return false;
    return children.some((child) => isActiveRoute(child.href));
  };

  // Function to render menu item
  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const IconComponent = item.icon;
    const isActive = isActiveRoute(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.href);
    const hasActiveChildItem = hasActiveChild(item.children);

    if (hasChildren) {
      return (
        <div key={item.href}>
          {/* Parent menu item with children */}
          <Tooltip
            content={t(item.labelKey)}
            placement="right"
            className={isDesktopExpanded ? "hidden" : "hidden md:block"}
          >
            <motion.button
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={clsx(
                "flex cursor-pointer items-center justify-between gap-3 px-3 py-2 rounded-lg w-full text-left",
                !isDesktopExpanded ? "md:justify-center md:px-0" : "",
                isActive || hasActiveChildItem
                  ? "bg-white text-primary shadow-sm font-medium"
                  : "text-white hover:bg-white/10",
                isChild && "ml-1 md:ml-0",
              )}
              onClick={() => {
                const authData = localStorage.getItem("authPOS");
                if (!authData) {
                  logout();
                  navigate("/");
                  return;
                }
                if (isTokenExpired()) {
                  setCountdown(20);
                  setIsExpModalOpen(true);
                  return;
                }
                if (!isDesktopExpanded && window.innerWidth >= 768) {
                  setIsDesktopExpanded(true);
                }
                toggleSubmenu(item.href);
              }}
            >
              <div className="w-full flex items-center justify-between">
                <div
                  className={clsx(
                    "flex items-center gap-3",
                    !isDesktopExpanded && "md:justify-center md:w-full",
                  )}
                >
                  {!isChild && (
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span
                    className={clsx(
                      "text-sm whitespace-nowrap",
                      !isDesktopExpanded && "md:hidden",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </div>
              </div>
              <div
                className={clsx(
                  "flex-shrink-0",
                  !isDesktopExpanded && "md:hidden",
                )}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 ease-linear" />
                ) : (
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 ease-linear" />
                )}
              </div>
            </motion.button>
          </Tooltip>

          {/* Children menu items */}
          <AnimatePresence>
            {isExpanded && item.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={clsx(
                  "overflow-hidden",
                  !isDesktopExpanded && "md:hidden",
                )}
              >
                <div className="ml-1 mt-1 space-y-1">
                  {item.children.map((child) => renderMenuItem(child, true))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    } else {
      // Regular menu item without children
      return (
        <motion.div
          key={item.href}
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="w-full"
        >
          <Tooltip
            content={t(item.labelKey)}
            placement="right"
            className={isDesktopExpanded ? "hidden" : "hidden md:block"}
          >
            <Link
              className={clsx(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
                !isDesktopExpanded ? "md:justify-center md:px-0" : "",
                isActive
                  ? "bg-white text-primary shadow-sm font-medium"
                  : "text-white hover:bg-white/10",
                isChild && "ml-4 w-auto md:ml-0",
              )}
              as={RouterLink}
              to={item.href}
              onClick={(e) => handleMenuClick(e)}
            >
              <div
                className={clsx(
                  "flex items-center gap-3",
                  !isDesktopExpanded && "md:justify-center md:w-full",
                )}
              >
                {isChild ? (
                  <CornerDownRight
                    size={15}
                    className={clsx(
                      "flex-shrink-0 -mr-1",
                      !isDesktopExpanded && "md:hidden",
                    )}
                  />
                ) : (
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                )}
                <span
                  className={clsx(
                    "text-sm whitespace-nowrap",
                    !isDesktopExpanded && "md:hidden",
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </div>

              {item.badge && item.badge > 0 && (
                <div
                  className={clsx(
                    "flex-shrink-0",
                    !isDesktopExpanded && "md:hidden",
                  )}
                >
                  <span className="bg-white text-warning text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                </div>
              )}
            </Link>
          </Tooltip>
        </motion.div>
      );
    }
  };

  return (
    <React.Fragment>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 backdrop-blur-xs z-40 md:hidden"
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onToggle();
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full bg-primary text-white transition-all duration-300 ease-in-out overflow-hidden border-r border-info/20",
          isOpen
            ? "translate-x-0 z-50 w-64 min-w-64"
            : "-translate-x-full z-50 w-64 min-w-64",
          isDesktopExpanded
            ? "md:translate-x-0 md:static md:z-auto md:w-64 md:min-w-64 lg:w-64 lg:min-w-64"
            : "md:translate-x-0 md:static md:z-auto md:w-20 md:min-w-20 lg:w-20 lg:min-w-20",
        )}
        style={{
          backgroundImage: `url(${bgLineName})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Background Overlays */}
        <div className="absolute inset-0 bg-primary/10 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent z-0 h-1/1" />

        <div className="relative z-10 h-full flex flex-col">
          {/* Sidebar Header */}
          <div
            className={clsx(
              "z-50 bg-primary border-b border-info min-h-[58px]",
              isDesktopExpanded
                ? "flex items-center justify-between py-1.5 px-3"
                : "flex items-center justify-center py-1.5 px-1",
            )}
          >
            <div
              className={clsx(
                "flex items-center gap-2 flex-grow min-w-0 overflow-x-auto scrollbar-hide",
                !isDesktopExpanded && "hidden",
              )}
            >
              <Image
                src={
                  getDisplayImageUrl(user?.user?.store?.logoUrl) || deePosLogo
                }
                fallbackSrc={deePosLogo}
                alt={user?.user?.store?.name || "Store Logo"}
                radius="full"
                className="w-12 h-12 aspect-square object-cover border-2 border-white/20"
              />
              <span className="font-bold text-lg whitespace-nowrap">
                {(() => {
                  const name = user?.user?.store?.name || t("sidebar.title");
                  return name.length >= 14
                    ? `${name.substring(0, 14)}...`
                    : name;
                })()}
              </span>
            </div>

            {/* Desktop Toggle Button */}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className={clsx(
                "hidden md:flex text-white min-w-8 h-8 rounded-lg hover:bg-white/20",
                !isDesktopExpanded && "w-10 h-10 bg-white/20 flex-shrink-0",
              )}
              onPress={() => setIsDesktopExpanded(!isDesktopExpanded)}
            >
              {isDesktopExpanded ? (
                <ArrowLeftToLine size={20} />
              ) : (
                <ArrowRightToLine size={20} />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="py-2 px-3 mt-0 flex-grow overflow-y-auto scrollbar-hide">
            {filteredGroups.map((group) => (
              <div key={group.titleKey} className="space-y-1 mb-6">
                <p
                  className={clsx(
                    "text-xs font-semibold text-white/70 mt-4 mb-2 uppercase tracking-wider",
                    !isDesktopExpanded ? "hidden" : "block",
                  )}
                >
                  {t(group.titleKey)}
                </p>

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => renderMenuItem(item))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-info/10">
            <p
              className={clsx(
                "text-[11px] flex justify-center items-center text-gray-400 font-medium",
                !isDesktopExpanded && "md:hidden",
              )}
            >
              <span>{t("auth.lastUpdated")}</span>&nbsp;v{versionApp.version}
            </p>
            {!isDesktopExpanded && (
              <p className="hidden md:flex text-[10px] justify-center items-center text-gray-400 font-medium w-full text-center">
                v{versionApp.version}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        isIconOnly
        className={clsx(
          "fixed top-3 z-50 md:hidden transition-all duration-300",
          isOpen
            ? "left-[272px] bg-white dark:bg-gray-800 shadow-lg"
            : "left-4 bg-white dark:bg-gray-800 shadow-md",
        )}
        size="md"
        variant="flat"
        onPress={onToggle}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Session Expired Modal */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={handleLogout}
        hideCloseButton
        isDismissable={false}
        className="max-w-md"
      >
        <ModalContent>
          <ModalBody className="p-12 min-h-64">
            <div className="flex flex-col items-center justify-center">
              <TriangleAlert size={53} className="text-danger" />
              <h2 className="text-center font-bold text-xl text-primary pt-6">
                ເຊດຊັນໝົດອາຍຸ (Session Expired)
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-sm">
                ເວລາການນຳໃຊ້ລະບົບຂອງທ່ານໄດ້ໝົດອາຍຸແລ້ວ.
                ກະລຸນາລ໋ອກອິນໃໝ່ເພື່ອຄວາມປອດໄພ.
              </p>
              <p className="text-sm">
                ລະບົບຈະອອກໄປໜ້າລ໋ອກອິນອັດຕະໂນມັດໃນອີກ{" "}
                <span className="font-bold text-primary">{countdown}</span>{" "}
                ວິນາທີ
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={handleLogout} className="w-full">
              ໄປໜ້າລ໋ອກອິນ (Login)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};
