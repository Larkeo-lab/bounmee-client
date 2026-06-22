import React from "react";
import {
  FileText,
  Hammer,
  Loader2,
  Clock,
  Activity,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Card, CardBody } from "@heroui/react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/routes/AuthContext";
import { useGetReports, ReportStatus, ReportItem } from "@/services/report/useReport";
import { policeSidebarItems, PoliceSection } from "@/config/sitebar";
import NewsSection from "./sections/news/NewsSection";
import ReportsSection from "./sections/report/ReportsSection";
import PoliceDistrictSection from "./sections/policeDistrict/PoliceDistrictSection";
import MyDistrictSection from "./sections/policeDistrict/MyDistrictSection";
import VillageChiefSection from "./sections/village/VillageChief";
import PoliceLayout from "@/layouts/PoliceLayout";

type SectionKey = PoliceSection;

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "ລໍຖ້າດຳເນີນການ",
    className: "bg-amber-100 text-amber-700",
  },
  IN_PROGRESS: {
    label: "ກຳລັງດຳເນີນການ",
    className: "bg-blue-100 text-blue-700",
  },
  APPROVED: { label: "ອະນຸມັດ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

export default function PoliceHome() {
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const userType = account?.userType as string | undefined;

  const [selectedReport, setSelectedReport] = React.useState<ReportItem | null>(null);

  const visibleItems = policeSidebarItems.filter(
    (i) =>
      !i.allowedUserTypes ||
      (userType && i.allowedUserTypes.includes(userType)),
  );

  // Initial section can be set via ?section= (e.g. when returning from a sub-route)
  const [searchParams] = useSearchParams();
  const initialSection =
    (searchParams.get("section") as SectionKey) || "dashboard";
  const [section, setSection] = React.useState<SectionKey>(initialSection);

  // Dashboard overview, scoped to the user's level:
  //  POLICE_DEPARTMENT → province, DISTRICT_POLICE → own district, VILLAGE_CHIEF → own village
  const reportScope: {
    provinceId?: string;
    districtId?: string;
    villageId?: string;
  } = {};
  if (userType === "DISTRICT_POLICE") {
    reportScope.districtId = account?.districtId;
  } else if (userType === "VILLAGE_CHIEF") {
    reportScope.villageId = account?.villageId;
  } else {
    reportScope.provinceId = account?.provinceId;
  }

  const { data: reports = [], isLoading } = useGetReports({
    ...reportScope,
    limit: 100,
  });

  const counts = React.useMemo(() => {
    const c = {
      total: reports.length,
      PENDING: 0,
      IN_PROGRESS: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    } as any;
    reports.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
    });

    return c;
  }, [reports]);

  const activeLabel = visibleItems.find((n) => n.key === section)?.label || "";

  return (
    <PoliceLayout activeSection={section} onSectionChange={setSection}>
      {section === "dashboard" ? (
        <DashboardSection
          counts={counts}
          reports={reports}
          isLoading={isLoading}
          onReportClick={(r) => {
            setSelectedReport(r);
            setSection("reports");
          }}
        />
      ) : section === "reports" ? (
        <ReportsSection selected={selectedReport} onSelect={setSelectedReport} />
      ) : section === "police-district" ? (
        <PoliceDistrictSection />
      ) : section === "my-village" ? (
        <MyDistrictSection />
      ) : section === "village-chief" ? (
        <VillageChiefSection />
      ) : section === "news" ? (
        <NewsSection />
      ) : (
        <Placeholder label={activeLabel} />
      )}
    </PoliceLayout>
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
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-800 leading-none">
            {value}
          </p>
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
  onReportClick,
}: {
  counts: any;
  reports: any[];
  isLoading: boolean;
  onReportClick: (report: any) => void;
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
            <StatCard
              label="ການແຈ້ງຄວາມທັງໝົດ"
              value={counts.total}
              icon={<FileText size={22} className="text-[#075e3d]" />}
              color="bg-[#075e3d]/10"
            />
            <StatCard
              label="ເຂົ້າໃໝ່"
              value={counts.PENDING}
              icon={<Clock size={22} className="text-amber-600" />}
              color="bg-amber-100"
            />
            <StatCard
              label="ກຳລັງດຳເນີນການ"
              value={counts.IN_PROGRESS}
              icon={<Activity size={22} className="text-blue-600" />}
              color="bg-blue-100"
            />
            <StatCard
              label="ອະນຸມັດແລ້ວ"
              value={counts.APPROVED}
              icon={<CheckCircle2 size={22} className="text-emerald-600" />}
              color="bg-emerald-100"
            />
          </div>

          {/* Recent reports */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6">
              <h3 className="font-bold text-gray-800 mb-4">
                ການແຈ້ງຄວາມລ່າສຸດ
              </h3>
              {recent.length === 0 ? (
                <p className="text-sm text-gray-400 font-bold py-6 text-center">
                  ຍັງບໍ່ມີຂໍ້ມູນ
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recent.map((r) => {
                    const st =
                      STATUS_CONFIG[r.status as ReportStatus] ||
                      STATUS_CONFIG.PENDING;

                    return (
                      <div
                        key={r.id}
                        onClick={() => onReportClick(r)}
                        className="flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors rounded-xl px-2 -mx-2 cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {r.title}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                            <MapPin size={11} /> {r.location}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}
                        >
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
        ສ່ວນນີ້ກຳລັງຢູ່ໃນຂັ້ນຕອນການພັດທະນາ.
        <br />
        This section is coming soon.
      </p>
    </div>
  );
}
