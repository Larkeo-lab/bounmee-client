import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Newspaper,
  Building2,
  Home,
  Settings,
  LogOut,
} from "lucide-react";
import { useDisclosure } from "@heroui/react";
import { useAuth } from "@/routes/AuthContext";
import { useGetReports } from "@/services/report/useReport";
import { useGetPoliceDepartmentsAndReports } from "@/services/police-district/usePoliceDistrict";
import { policeSidebarItems, PoliceSection } from "@/config/sitebar";
import ModalConfirm from "@/components/common/modal-confirm";

type SectionKey = PoliceSection;

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  reports: <FileText size={20} />,
  "police-district": <Building2 size={20} />,
  "village-chief": <Home size={20} />,
  citizens: <Users size={20} />,
  news: <Newspaper size={20} />,
  organization: <Building2 size={20} />,
  settings: <Settings size={20} />,
};

interface PoliceLayoutProps {
  activeSection: SectionKey;
  onSectionChange?: (section: SectionKey) => void;
  title?: string;
  children: React.ReactNode;
}

export default function PoliceLayout({
  activeSection,
  onSectionChange,
  title,
  children,
}: PoliceLayoutProps) {
  const { logout, user: authData } = useAuth();
  const navigate = useNavigate();
  const logoutModal = useDisclosure();

  const account = (authData as any)?.user;
  const userType = account?.userType as string | undefined;

  const visibleItems = policeSidebarItems.filter(
    (i) => !i.allowedUserTypes || (userType && i.allowedUserTypes.includes(userType))
  );

  const reportScope: Record<string, any> = {};
  if (userType === "VILLAGE_CHIEF") {
    reportScope.villageId = account?.villageId;
  } else if (userType === "DISTRICT_POLICE") {
    reportScope.districtId = account?.districtId;
  } else if (userType === "POLICE_DEPARTMENT") {
    reportScope.provinceId = account?.provinceId;
  }

  const { data: reports = [] } = useGetReports({ ...reportScope, limit: 100 });
  const reportsCount = reports.length;

  const { data: districts = [] } = useGetPoliceDepartmentsAndReports({
    enabled: userType === "POLICE_DEPARTMENT",
  });
  const districtsCount = districts.reduce(
    (sum: number, d: any) => sum + (d.badgeCount || 0),
    0,
  );

  const activeLabel = title || visibleItems.find((n) => n.key === activeSection)?.label || "";

  const handleItemClick = (key: SectionKey) => {
    if (onSectionChange) {
      onSectionChange(key);
    } else {
      navigate(`/police/home?section=${key}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef0f2] text-gray-800 font-sans">
      {/* Sidebar — icon-only rail on small screens, full on lg+ */}
      <aside className="w-16 lg:w-64 shrink-0 bg-[#075e3d] text-white flex flex-col h-full transition-all duration-200">
        {/* Brand */}
        <div className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-5 h-16 lg:h-20 border-b border-white/10">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="h-9 w-9 lg:h-10 lg:w-10 object-contain bg-white rounded-full p-1 shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <div className="hidden lg:flex flex-col leading-tight">
            <span className="font-bold text-sm">ກົມໃຫຍ່ຕຳຫຼວດ</span>
            <span className="text-[10px] text-white/70">Police Department</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            let count = 0;
            if (item.key === "reports") {
              count = reportsCount;
            } else if (item.key === "police-district") {
              count = districtsCount;
            }
            const showCount = count > 0;

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  activeSection === item.key
                    ? "bg-white text-[#075e3d] shadow"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <span className="shrink-0 relative">
                  {ICONS[item.icon]}
                  {showCount && (
                    <span className="lg:hidden absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </span>
                <span className="hidden lg:inline truncate flex-1 text-left">{item.label}</span>
                {showCount && (
                  <span className="hidden lg:flex min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold items-center justify-center shrink-0">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-white/10 p-2 lg:p-4 space-y-3">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold uppercase shrink-0">
              {(account?.userName || "P").slice(0, 1)}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-sm font-bold truncate">{account?.userName || "Police"}</p>
              <p className="text-[10px] text-white/60 truncate">
                {account?.email || userType || "POLICE"}
              </p>
            </div>
          </div>
          <button
            onClick={logoutModal.onOpen}
            title="ອອກຈາກລະບົບ"
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl py-2 text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden lg:inline">ອອກຈາກລະບົບ</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-4 md:px-6 shrink-0">
          <h1 className="text-base md:text-lg font-bold text-gray-800 truncate">{activeLabel}</h1>
          <span className="text-[10px] md:text-xs font-bold text-[#075e3d] bg-[#075e3d]/10 px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap">
            {userType || "POLICE"}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {/* Logout confirmation */}
      <ModalConfirm
        isOpen={logoutModal.isOpen}
        onOpenChange={logoutModal.onOpenChange}
        title="ອອກຈາກລະບົບ?"
        content="ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?"
        confirmText="ອອກຈາກລະບົບ"
        cancelText="ຍົກເລີກ"
        confirmColor="danger"
        icon={<LogOut size={20} className="text-red-500" />}
        onConfirm={logout}
      />
    </div>
  );
}
