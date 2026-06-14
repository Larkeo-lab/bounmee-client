import React from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Newspaper,
  Building2,
  Home,
  Settings,
  LogOut,
  Hammer,
  Loader2,
  Clock,
  Activity,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Card, CardBody, useDisclosure } from "@heroui/react";

import { useAuth } from "@/routes/AuthContext";
import { useGetReports, ReportStatus } from "@/services/report/useReport";
import { policeSidebarItems, PoliceSection } from "@/config/sitebar";
import ModalConfirm from "@/components/common/modal-confirm";
import NewsSection from "./sections/news/NewsSection";
import ReportsSection from "./sections/report/ReportsSection";
import PoliceDistrictSection from "./sections/policeDistrict/PoliceDistrictSection";
import VillageChiefSection from "./sections/village/VillageChief";

type SectionKey = PoliceSection;

// Map the config's semantic icon keys to lucide components
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

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "ລໍຖ້າດຳເນີນການ", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "ອະນຸມັດ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

export default function PoliceHome() {
  const { logout, user: authData } = useAuth();
  const account = (authData as any)?.user;
  const userType = account?.userType as string | undefined;

  // Hide items restricted to higher roles (e.g. VILLAGE_CHIEF can't see
  // the district/village-chief management menus)
  const visibleItems = policeSidebarItems.filter(
    (i) => !i.allowedUserTypes || (userType && i.allowedUserTypes.includes(userType)),
  );

  const [section, setSection] = React.useState<SectionKey>("dashboard");
  const logoutModal = useDisclosure();

  // Reports currently waiting at this user's level (same scope as ReportsSection)
  const reportScope: Record<string, any> = {};
  if (userType === "VILLAGE_CHIEF") {
    reportScope.villageId = account?.villageId;
    reportScope.currentAssignee = "VILLAGE_CHIEF";
  } else if (userType === "DISTRICT_POLICE") {
    reportScope.districtId = account?.districtId;
    reportScope.currentAssignee = "DISTRICT_POLICE";
  } else if (userType === "POLICE_DEPARTMENT") {
    reportScope.provinceId = account?.provinceId;
    reportScope.currentAssignee = "POLICE_DEPARTMENT";
  }

  const { data: reports = [], isLoading } = useGetReports({ ...reportScope, limit: 100 });
  const reportsCount = reports.length;

  const counts = React.useMemo(() => {
    const c = { total: reports.length, PENDING: 0, IN_PROGRESS: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 } as any;
    reports.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });

    return c;
  }, [reports]);

  const activeLabel = visibleItems.find((n) => n.key === section)?.label || "";

  const go = (key: SectionKey) => setSection(key);

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
            onError={(e) => { e.currentTarget.src = "/logo.png"; }}
          />
          <div className="hidden lg:flex flex-col leading-tight">
            <span className="font-bold text-sm">ກົມໃຫຍ່ຕຳຫຼວດ</span>
            <span className="text-[10px] text-white/70">Police Department</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const showCount = item.key === "reports" && reportsCount > 0;

            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${section === item.key
                    ? "bg-white text-[#075e3d] shadow"
                    : "text-white/80 hover:bg-white/10"
                  }`}
              >
                <span className="shrink-0 relative">
                  {ICONS[item.icon]}
                  {showCount && (
                    <span className="lg:hidden absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {reportsCount}
                    </span>
                  )}
                </span>
                <span className="hidden lg:inline truncate flex-1 text-left">{item.label}</span>
                {showCount && (
                  <span className="hidden lg:flex min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold items-center justify-center shrink-0">
                    {reportsCount}
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
              <p className="text-[10px] text-white/60 truncate">{account?.email || userType || "POLICE"}</p>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {section === "dashboard" ? (
            <DashboardSection counts={counts} reports={reports} isLoading={isLoading} />
          ) : section === "reports" ? (
            <ReportsSection />
          ) : section === "police-district" ? (
            <PoliceDistrictSection />
          ) : section === "village-chief" ? (
            <VillageChiefSection />
          ) : section === "news" ? (
            <NewsSection />
          ) : (
            <Placeholder label={activeLabel} />
          )}
        </main>
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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="shadow-sm border border-gray-100 rounded-2xl">
      <CardBody className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-800 leading-none">{value}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function DashboardSection({
  counts,
  reports,
  isLoading,
}: {
  counts: any;
  reports: any[];
  isLoading: boolean;
}) {
  const recent = reports.slice(0, 6);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <Card className="bg-[#075e3d] border-none rounded-3xl text-white shadow-lg">
        <CardBody className="p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">ສະບາຍດີ, ກົມໃຫຍ່ຕຳຫຼວດ 👮</h2>
          <p className="text-sm text-white/90 mt-1 font-medium">
            ພາບລວມການແຈ້ງຄວາມ ແລະ ການເຄື່ອນໄຫວທັງລະບົບ
          </p>
        </CardBody>
      </Card>

      {/* Stat cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="ການແຈ້ງຄວາມທັງໝົດ" value={counts.total} icon={<FileText size={22} className="text-[#075e3d]" />} color="bg-[#075e3d]/10" />
            <StatCard label="ລໍຖ້າດຳເນີນການ" value={counts.PENDING} icon={<Clock size={22} className="text-amber-600" />} color="bg-amber-100" />
            <StatCard label="ກຳລັງດຳເນີນການ" value={counts.IN_PROGRESS} icon={<Activity size={22} className="text-blue-600" />} color="bg-blue-100" />
            <StatCard label="ອະນຸມັດແລ້ວ" value={counts.APPROVED} icon={<CheckCircle2 size={22} className="text-emerald-600" />} color="bg-emerald-100" />
          </div>

          {/* Recent reports */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6">
              <h3 className="font-bold text-gray-800 mb-4">ການແຈ້ງຄວາມລ່າສຸດ</h3>
              {recent.length === 0 ? (
                <p className="text-sm text-gray-400 font-bold py-6 text-center">ຍັງບໍ່ມີຂໍ້ມູນ</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recent.map((r) => {
                    const st = STATUS_CONFIG[r.status as ReportStatus] || STATUS_CONFIG.PENDING;

                    return (
                      <div key={r.id} className="flex items-center gap-3 py-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{r.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                            <MapPin size={11} /> {r.location}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#075e3d]/10 flex items-center justify-center">
        <Hammer size={36} className="text-[#075e3d]" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-800">{label}</h2>
      <p className="text-sm font-bold text-gray-500 max-w-sm">
        ສ່ວນນີ້ກຳລັງຢູ່ໃນຂັ້ນຕອນການພັດທະນາ.<br />This section is coming soon.
      </p>
    </div>
  );
}
