import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Smartphone,
  ChevronRight,
  Check,
  FileText,
  MapPin,
  Building2,
  Activity,
  Home as HomeIcon,
} from "lucide-react";
import { Card, CardBody, Button, Image, Skeleton } from "@heroui/react";
import Navbar from "@/components/navbar";
import News from "@/pages/news/News";
import { useAuth } from "@/routes/AuthContext";
import {
  useGetReports,
  ReportItem,
  ReportStatus,
} from "@/services/report/useReport";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<"home" | "news" | "menu">(
    "home",
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleSettings = () => {
    navigate("/settings/profile");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* 1. Header (Ministry Title & Logo) */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-[#075e3d] leading-tight">
              ກະຊວງປ້ອງກັນຄວາມສະຫງົບ
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-wide">
              Ministry of Public Security
            </span>
          </div>
        </div>
      </header>

      {/* 2. Sub-header / Navbar (Green Bar) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={handleBack}
        onSettings={handleSettings}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10 justify-between">
        {/* Tab 1: MENU (Mockup Match) */}
        {activeTab === "menu" && (
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 justify-items-center mb-8">
              {/* Button 1: ຕ້ອງການແຈ້ງຄວາມ */}
              <Button
                onClick={() => navigate("/report/create")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                {/* White Square Icon container */}
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <div className="relative">
                    <Smartphone size={32} className="text-gray-800" />
                    {/* Pulsing red warning notification badge */}
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-pulse">
                      !
                    </span>
                  </div>
                </div>
                {/* Text content */}
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ຕ້ອງການແຈ້ງຄວາມ
                </span>
                <ChevronRight
                  size={24}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                />
              </Button>

              {/* Button 2: ສຶກສາກົດໝາຍ */}
              <Button
                onClick={() => navigate("/law-education")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                {/* White Square Icon container */}
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Scale size={32} className="text-[#075e3d]" />
                </div>
                {/* Text content */}
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ສຶກສາກົດໝາຍ
                </span>
                <ChevronRight
                  size={24}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                />
              </Button>
            </div>

            {/* Row 2: ສຶກສາກົດຈະລາຈອນ + ຄວາມຄືບໜ້າແຈ້ງຄວາມ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 justify-items-center mb-10">
              <Button
                onClick={() => navigate("/report/progress")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Activity size={32} className="text-[#075e3d]" />
                </div>
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ຄວາມຄືບໜ້າແຈ້ງຄວາມ
                </span>
                <ChevronRight
                  size={24}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                />
              </Button>
              <Button
                onClick={() => navigate("/traffic-rules")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                {/* White Square Icon container */}
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  {/* Styled traffic light icon mimicking mockup */}
                  <div className="flex flex-col space-y-0.5 items-center bg-gray-800 p-1.5 rounded-md w-7 h-10 justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                {/* Text content */}
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ສຶກສາກົດຈະລາຈອນ
                </span>
                <ChevronRight
                  size={24}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                />
              </Button>

              {/* Button: ຄວາມຄືບໜ້າແຈ້ງຄວາມ (moved from navbar dropdown) */}
            </div>
          </div>
        )}

        {/* Tab 2: HOME (Introduction of the Portal - styled with HeroUI) */}
        {activeTab === "home" && (
          <div className="flex-1 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
            {/* Citizen's latest report (status + which village/district) — or the
                welcome banner when they have not reported anything yet */}
            <CitizenReportOverview />

            {/* Core Services Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                ການບໍລິການຫຼັກຂອງພວກເຮົາ (Our Core Services)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Online Reporting */}
                <Card className="shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <CardBody className="p-6 flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone size={24} />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-base text-gray-800">
                        ແຈ້ງຄວາມອອນລາຍ
                      </h5>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        ທ່ານສາມາດແຈ້ງເຫດດ່ວນເຫດຮ້າຍ ຫຼື ຄະດີຄວາມຕ່າງໆ
                        ພ້ອມອັບໂຫຼດຫຼັກຖານໄດ້ທັນທີຜ່ານລະບົບ
                        ໂດຍບໍ່ຕ້ອງເດີນທາງໄປສະຖານີຕຳຫຼວດ.
                      </p>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 2: Study Law */}
                <Card className="shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <CardBody className="p-6 flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Scale size={24} />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-base text-gray-800">
                        ສຶກສາກົດໝາຍ
                      </h5>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        ສຶກສາຂໍ້ມູນກົດໝາຍທີ່ສຳຄັນຂອງ ສປປ ລາວ
                        ເພື່ອສ້າງຄວາມເຂົ້າໃຈໃນສິດ ແລະ ພັນທະຂອງພົນລະເມືອງ
                        ເຮັດໃຫ້ສັງຄົມມີຄວາມສະຫງົບ.
                      </p>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 3: Traffic Rules */}
                <Card className="shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <CardBody className="p-6 flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      {/* Traffic light icon */}
                      <div className="flex flex-col space-y-0.5 items-center bg-gray-800 p-1 rounded-sm w-4.5 h-6 justify-center">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        <div className="w-1 h-1 rounded-full bg-yellow-500" />
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-base text-gray-800">
                        ກົດຈະລາຈອນ
                      </h5>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        ຄູ່ມືຮຽນຮູ້ກົດລະບຽບຈະລາຈອນ, ປ້າຍເຕືອນ, ເຄື່ອງໝາຍຕ່າງໆ
                        ເພື່ອຄວາມປອດໄພໃນການສັນຈອນ ແລະ
                        ຫຼຸດຜ່ອນອຸປະຕິເຫດບົນທ້ອງຖະໜົນ.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* How It Works Step-by-Step */}
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-6 space-y-6">
                <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                  ຂັ້ນຕອນການນຳໃຊ້ລະບົບ (How to use the system)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#075e3d]/10 text-[#075e3d] font-black text-sm flex items-center justify-center border-2 border-[#075e3d]">
                      1
                    </div>
                    <h5 className="font-bold text-sm text-gray-800">
                      ເຂົ້າສູ່ລະບົບ
                    </h5>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px]">
                      ລົງທະບຽນ ແລະ ເຂົ້າສູ່ລະບົບດ້ວຍຊື່ຜູ້ໃຊ້ ແລະ
                      ລະຫັດຜ່ານທີ່ປອດໄພ.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#075e3d]/10 text-[#075e3d] font-black text-sm flex items-center justify-center border-2 border-[#075e3d]">
                      2
                    </div>
                    <h5 className="font-bold text-sm text-gray-800">
                      ເລືອກບໍລິການ
                    </h5>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px]">
                      ເລືອກເມນູແຈ້ງຄວາມ ຫຼື ເເລືອກສຶກສາບົດຮຽນກົດໝາຍ/ກົດຈະລາຈອນ.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#075e3d]/10 text-[#075e3d] font-black text-sm flex items-center justify-center border-2 border-[#075e3d]">
                      3
                    </div>
                    <h5 className="font-bold text-sm text-gray-800">
                      ຕິດຕາມຜົນ
                    </h5>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px]">
                      ຕິດຕາມສະຖານະຂອງການແຈ້ງເຫດ ຫຼື ປະຫວັດຂອງທ່ານໄດ້ຕະຫຼອດ 24
                      ຊົ່ວໂມງ.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 3: NEWS (Ministry Announcements) */}
        {activeTab === "news" && <News />}

        {/* 4. Bottom Lao Patriotic Quote (Mockup Match) — hidden on News tab */}
        {activeTab !== "news" && (
          <div className="text-center max-w-xl mx-auto py-6 space-y-1 mt-6">
            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
              ຄວາມຄິດເຫັນຂອງທຸກທ່ານມີຄ່າທານພັດທະນາປັບປຸງການເຮັດ
            </p>
            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
              ວຽກໃຫ້ດີຂຶ້ນ ໃຫ້ເຊື່ອໝັ້ນ ແລະ ໄວ້ວາງໃຈໃນການເຮັດວຽກ
            </p>
            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
              ເພາະພວກເຮົາມາຈາກປະຊາຊົນເພື່ອປະຊາຊົນ
            </p>
          </div>
        )}
      </main>

      {/* 5. Footer (Solid Green Bar) */}
      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}

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

const FALLBACK_IMG = "/assets/logo.png";

function WelcomeBanner() {
  return (
    <Card className="bg-[#075e3d] border-none shadow-xl rounded-3xl text-white relative overflow-hidden">
      <CardBody className="p-8 flex flex-col md:flex-row items-center justify-between z-10">
        <div className="space-y-4 max-w-xl">
          <span className="bg-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            ລະບົບບໍລິການພົນລະເມືອງອອນລາຍ
          </span>
          <h3 className="text-3xl font-extrabold tracking-wide leading-tight">
            ຍິນດີຕ້ອນຮັບສູ່ ລະບົບ Bounmee
          </h3>
          <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium">
            ລະບົບ Bounmee ແມ່ນເວັບໄຊທ໌ບໍລິການປະຊາຊົນແບບອອນລາຍ
            ພາຍໃຕ້ການຄຸ້ມຄອງຂອງ ກະຊວງປ້ອງກັນຄວາມສະຫງົບ (Ministry of Public
            Security).
            ພັດທະນາຂຶ້ນເພື່ອເປັນຊ່ອງທາງໃຫ້ພົນລະເມືອງເຂົ້າເຖິງການບໍລິການຂອງລັດໄດ້ຢ່າງສະດວກ,
            ວ່ອງໄວ ແລະ ປອດໄພ.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none pr-8">
          <Image
            src="/assets/logo.png"
            alt="Decorative Logo"
            className="w-64 h-64 object-contain"
          />
        </div>
      </CardBody>
    </Card>
  );
}

// Citizen home: show their latest report (which village / district + escalation
// progress) once they have reported something; otherwise the welcome banner.
function CitizenReportOverview() {
  const navigate = useNavigate();
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const userId = account?.id as string | undefined;

  const { data: reports = [], isLoading } = useGetReports({
    userId,
    limit: 100,
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-3xl" />;
  }

  if (reports.length === 0) {
    return <WelcomeBanner />;
  }

  const report = reports[0];

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-gray-700">
        ການແຈ້ງຄວາມຫຼ້າສຸດຂອງທ່ານ
      </h4>

      <Card className="shadow-sm border border-gray-100 rounded-3xl">
        <CardBody className="p-4 md:p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportMiniCard
              report={report}
              onClick={() => navigate(`/report/${report.id}`)}
            />
            <InfoMiniCard
              icon={<HomeIcon size={22} className="text-[#075e3d]" />}
              title={
                report.village?.nameLo
                  ? `ບ້ານ${report.village.nameLo}`
                  : "ບ້ານ —"
              }
              lines={[report.location || "-", formatDate(report.createdAt)]}
            />
            <InfoMiniCard
              icon={<Building2 size={22} className="text-[#075e3d]" />}
              title={
                report.district?.nameLo
                  ? `ເມືອງ${report.district.nameLo}`
                  : "ເມືອງ —"
              }
              lines={[
                report.province?.nameLo || "ນະຄອນຫຼວງວຽງຈັນ",
                formatDate(report.createdAt),
              ]}
            />
          </div>

          <ReportProgress report={report} />
        </CardBody>
      </Card>
    </div>
  );
}

function ReportMiniCard({
  report,
  onClick,
}: {
  report: ReportItem;
  onClick: () => void;
}) {
  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="h-32 w-full bg-slate-100">
        {report.image ? (
          <img
            src={getDisplayImageUrl(report.image)}
            alt={report.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FileText size={28} />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-bold text-sm text-gray-800 line-clamp-1">
            {report.title}
          </h5>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${st.className}`}
          >
            {st.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
          <MapPin size={11} className="shrink-0" /> {report.location}
        </p>
        <p className="text-[10px] text-gray-400">
          {formatDate(report.createdAt)}
        </p>
      </div>
    </button>
  );
}

function InfoMiniCard({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 flex flex-col gap-2">
      <div className="w-11 h-11 rounded-xl bg-[#075e3d]/10 flex items-center justify-center">
        {icon}
      </div>
      <h5 className="font-bold text-sm text-gray-800 line-clamp-1">{title}</h5>
      <div className="space-y-0.5">
        {lines.map((l, i) => (
          <p key={i} className="text-xs text-gray-500 font-medium line-clamp-1">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

// 3-step escalation: ປະຊາຊົນ → ນາຍບ້ານ → ປກສ ເມືອງ
function ReportProgress({ report }: { report: ReportItem }) {
  const reached = new Set(
    [
      ...(report.history || []).map((h) => h.toAssignee),
      report.currentAssignee,
    ].filter(Boolean) as string[],
  );

  const steps = [
    { label: "ປະຊາຊົນ", sub: "ສົ່ງແຈ້ງຄວາມແລ້ວ", done: true },
    {
      label: "ນາຍບ້ານ",
      sub: reached.has("VILLAGE_CHIEF") ? "ກຳລັງດຳເນີນງານ" : "ລໍຖ້າ",
      done: reached.has("VILLAGE_CHIEF"),
    },
    {
      label: "ປກສ ເມືອງ",
      sub: reached.has("DISTRICT_POLICE")
        ? "ກຳລັງດຳເນີນງານ"
        : "ບໍ່ໄດ້ຮັບແຈ້ງຄວາມ",
      done: reached.has("DISTRICT_POLICE"),
    },
  ];

  return (
    <div className="flex items-start">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className="flex flex-col items-center text-center shrink-0 w-24">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                s.done ? "bg-[#22a06b] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.done ? <Check size={16} /> : i + 1}
            </div>
            <span className="text-sm font-bold text-gray-800 mt-1.5">
              {s.label}
            </span>
            <span
              className={`text-[11px] font-bold ${
                s.done ? "text-[#22a06b]" : "text-red-500"
              }`}
            >
              {s.sub}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-1 rounded-full mt-3.5 ${
                steps[i + 1].done ? "bg-[#22a06b]" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
