import { Card, CardBody } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/routes/AuthContext";
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
} from "lucide-react";

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
    icon: Users, // Using Users as a fallback icon
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
];

const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Permission filtering logic
  const userRole = user?.user?.role;
  const userPermissions = user?.user?.employee?.permission?.permissions || {};

  const canAccess = (key?: string) => {
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
        <p className="text-default-500">
          ຈັດການข้อมูลพื้นฐานและตั้งค่าระบบของท่าน
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.href}
            isPressable
            onPress={() => navigate(item.href)}
            className="group border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <CardBody className="p-6 flex flex-row items-center gap-6">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon size={32} strokeWidth={2} />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-default-800 mb-1">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-default-500 line-clamp-1">
                  {t(item.descriptionKey) || "ตั้งค่าและจัดการข้อมูลของคุณ"}
                </p>
              </div>
              <div className="text-default-300 group-hover:text-primary transition-colors">
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
