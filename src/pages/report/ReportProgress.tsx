import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  Inbox,
  FileText,
  Check,
  Calendar,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { useGetReports, ReportStatus } from "@/services/report/useReport";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "ລໍຖ້າດຳເນີນການ", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "ອະນຸມັດ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

// Escalation steps a report travels through
const STEPS = [
  { key: "VILLAGE_CHIEF", label: "ນາຍບ້ານ" },
  { key: "DISTRICT_POLICE", label: "ປກສ ເມືອง" },
  { key: "POLICE_DEPARTMENT", label: "ກົມໃຫຍ່" },
];

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso?.slice(0, 10) || "";
  }
};

export default function ReportProgress() {
  const navigate = useNavigate();
  const { user: authData } = useAuth();
  const userId = (authData as any)?.user?.id;

  const { data: reports = [], isLoading } = useGetReports({ userId });

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => { e.currentTarget.src = "/logo.png"; }}
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

      {/* Green Nav Bar */}
      <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>
        <span className="text-base font-bold tracking-wide">ຄວາມຄືບໜ້າແຈ້ງຄວາມ / Progress</span>
        <div className="w-9" />
      </nav>

      {/* Content */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10">
        <div className="max-w-2xl mx-auto w-full space-y-4">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
              <p className="text-sm font-bold text-gray-500">ກຳລັງໂຫຼດ...</p>
            </div>
          ) : reports.length === 0 ? (
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-10 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Inbox size={36} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-500">
                  ຍັງບໍ່ມີການແຈ້ງຄວາມ<br />No reports yet
                </p>
                <Button
                  onClick={() => navigate("/report/create")}
                  className="bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl px-6 cursor-pointer"
                >
                  + ແຈ້ງຄວາມໃໝ່
                </Button>
              </CardBody>
            </Card>
          ) : (
            reports.map((report) => {
              const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
              const currentIdx = STEPS.findIndex((s) => s.key === report.currentAssignee);

              return (
                <Card key={report.id} className="shadow-sm border border-gray-100 rounded-3xl">
                  <CardBody className="p-5 space-y-4">
                    {/* Top: image + title + status */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        {report.image ? (
                          <img src={getDisplayImageUrl(report.image)} alt={report.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={22} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{report.title}</h3>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} /> {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Progress stepper */}
                    <div className="flex items-center pt-1">
                      {STEPS.map((step, i) => {
                        const reached = currentIdx >= 0 && i <= currentIdx;
                        const isCurrent = i === currentIdx;

                        return (
                          <div key={step.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                  reached
                                    ? "bg-[#075e3d] border-[#075e3d] text-white"
                                    : "bg-white border-gray-300 text-gray-400"
                                } ${isCurrent ? "ring-4 ring-[#075e3d]/15" : ""}`}
                              >
                                {reached && !isCurrent ? <Check size={14} /> : i + 1}
                              </div>
                              <span className={`text-[10px] font-bold ${reached ? "text-[#075e3d]" : "text-gray-400"}`}>
                                {step.label}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className={`h-0.5 flex-1 mx-1 -mt-4 ${i < currentIdx ? "bg-[#075e3d]" : "bg-gray-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}

        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
