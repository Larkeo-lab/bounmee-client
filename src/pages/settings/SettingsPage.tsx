import { Card, CardBody } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  Layers,
  CreditCard,
  Users,
  Printer,
  UserCircle,
  BadgeDollarSign,
  ChevronRight,
  Armchair,
  UserCheck,
  ShieldCheck,
  Barcode,
} from "lucide-react";

import { useAuth } from "@/routes/AuthContext";

interface SettingItem {
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: any;
  color: string;
  permissionKey?: string;
}

const settingsItems: SettingItem[] = [
  {
    titleKey: "sidebar.menu.manageProduct",
    descriptionKey: "settings.description.product",
    href: "/settings/product",
    icon: Package,
    color: "bg-blue-500/10 text-blue-500",
    permissionKey: "product",
  },
  {
    titleKey: "sidebar.menu.manageCategory",
    descriptionKey: "settings.description.category",
    href: "/settings/category",
    icon: Layers,
    color: "bg-purple-500/10 text-purple-500",
    permissionKey: "category",
  },
  {
    titleKey: "sidebar.menu.manageBank",
    descriptionKey: "settings.description.bank",
    href: "/settings/bank",
    icon: CreditCard,
    color: "bg-green-500/10 text-green-500",
    permissionKey: "bank",
  },
  {
    titleKey: "sidebar.menu.manageEmployee",
    descriptionKey: "settings.description.employee",
    href: "/settings/employee",
    icon: Users,
    color: "bg-orange-500/10 text-orange-500",
    permissionKey: "employee",
  },
  {
    titleKey: "sidebar.menu.managePrinter",
    descriptionKey: "settings.description.printer",
    href: "/settings/printer",
    icon: Printer,
    color: "bg-gray-500/10 text-gray-500",
    permissionKey: "printer",
  },
  {
    titleKey: "sidebar.menu.manageProfile",
    descriptionKey: "settings.description.profile",
    href: "/settings/profile",
    icon: UserCircle,
    color: "bg-pink-500/10 text-pink-500",
    permissionKey: "profile",
  },
  {
    titleKey: "sidebar.menu.manageMoneyRate",
    descriptionKey: "settings.description.moneyRate",
    href: "/settings/money-rate",
    icon: BadgeDollarSign,
    color: "bg-cyan-500/10 text-cyan-500",
    permissionKey: "money_rate",
  },
  {
    titleKey: "sidebar.menu.managePermission",
    descriptionKey: "settings.description.employee", // Fallback description
    href: "/permission-manage",
    icon: ShieldCheck,
    color: "bg-red-500/10 text-red-500",
    permissionKey: "role_permission",
  },
  {
    titleKey: "sidebar.menu.manageTable",
    descriptionKey: "settings.description.table",
    href: "/settings/table",
    icon: Armchair,
    color: "bg-amber-500/10 text-amber-500",
    permissionKey: "table_settings",
  },
  {
    titleKey: "sidebar.menu.manageMember",
    descriptionKey: "settings.description.member",
    href: "/settings/member",
    icon: UserCheck,
    color: "bg-amber-500/10 text-amber-500",
    permissionKey: "member_settings",
  },
  {
    titleKey: "sidebar.menu.create-barcode",
    descriptionKey: "settings.description.member",
    href: "/settings/create-barcode",
    icon: Barcode,
    color: "bg-amber-500/10 text-amber-500",
    permissionKey: "member_settings",
  },
];

const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Permission filtering logic
  const userRole = user?.user?.role;
  const userPermissions = user?.user?.employee?.permission?.permissions || {};

  const storeType = user?.user?.store?.type;

  const canAccess = (key?: string) => {
    // StoreType Filtering logic
    if (storeType !== "RESTAURANT" && key === "table_settings") {
      return false;
    }

    if (!key) return true;
    if (userRole === "SUPER_ADMIN" || userRole === "STORE_ADMIN") return true;
    const modulePerms = userPermissions[key] as string[] | undefined;

    if (modulePerms && modulePerms.includes("read")) return true;

    return false;
  };

  const filteredItems = settingsItems.filter((item) =>
    canAccess(item.permissionKey),
  );

  return (
    <div className=" m-4 mr-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary mb-2">
          {t("sidebar.menu.setting")}
        </h1>
        <p className="text-default-500">{t("settings.description.main")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.href}
            isPressable
            className="group border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            onPress={() => navigate(item.href)}
          >
            <CardBody className="p-3 md:p-6 flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm md:text-lg font-bold text-default-800 mb-0 md:mb-1 line-clamp-2 md:line-clamp-1">
                  {t(item.titleKey)}
                </h3>
                <p className="text-xs md:text-sm text-default-500 line-clamp-1 hidden md:block">
                  {t(item.descriptionKey)}
                </p>
              </div>
              <div className="text-default-300 group-hover:text-primary transition-colors hidden md:block">
                <ChevronRight size={24} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
