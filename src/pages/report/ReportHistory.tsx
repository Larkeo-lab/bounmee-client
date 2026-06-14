import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  FileText,
  MapPin,
  Calendar,
  Inbox,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { useGetReports, ReportStatus } from "@/services/report/useReport";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "ລໍຖ້າດຳເນີນການ", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "ອະນຸມັດ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

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

export default function ReportHistory() {
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
        <span className="text-base font-bold tracking-wide">ປະຫວັດແຈ້ງຄວາມ / Report History</span>
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
                  ຍັງບໍ່ມີປະຫວັດການແຈ້ງຄວາມ<br />No reports yet
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
              const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
              const place = [report.village?.nameLo, report.district?.nameLo, report.province?.nameLo]
                .filter(Boolean)
                .join(", ");

              return (
                <Card
                  key={report.id}
                  isPressable
                  onPress={() => navigate(`/report/${report.id}`)}
                  className="shadow-sm border border-gray-100 rounded-3xl w-full text-left active:scale-[0.99] transition-transform"
                >
                  <CardBody className="p-4 flex flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      {report.image ? (
                        <img src={getDisplayImageUrl(report.image)} alt={report.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={28} className="text-gray-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{report.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} className="shrink-0" />
                        <span className="line-clamp-1">{place || report.location}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} className="shrink-0" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
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
