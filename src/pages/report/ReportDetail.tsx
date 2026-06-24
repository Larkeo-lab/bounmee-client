import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  ImageOff,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { useGetReport, ReportStatus } from "@/services/report/useReport";
import { getDisplayImageUrl } from "@/lib/utils";
import { ShowImage } from "@/utils/showImage";

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

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

export default function ReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError } = useGetReport(id);

  const status = report ? STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING : null;
  const place = report
    ? [report.village?.nameLo, report.district?.nameLo, report.province?.nameLo].filter(Boolean).join(", ")
    : "";
  const gallery = report
    ? [report.image, ...(report.attachments || [])].filter((v, i, a) => v && a.indexOf(v) === i)
    : [];

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
        <span className="text-base font-bold tracking-wide">ລາຍລະອຽດແຈ້ງຄວາມ / Report Detail</span>
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
          ) : isError || !report ? (
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-10 flex flex-col items-center text-center gap-4">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-sm font-bold text-gray-500">
                  ບໍ່ພົບຂໍ້ມູນແຈ້ງຄວາມ<br />Report not found
                </p>
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-[#075e3d] text-white font-bold rounded-2xl px-6 cursor-pointer"
                >
                  ກັບຄືນ
                </Button>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Images */}
              <Card className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                <CardBody className="p-0">
                  {gallery.length > 0 ? (
                    <>
                      <div className="w-full aspect-video bg-slate-100">
                        <ShowImage src={getDisplayImageUrl(gallery[0] as string)} alt={report.title} className="w-full h-full object-cover" />
                      </div>
                      {gallery.length > 1 && (
                        <div className="flex gap-2 p-3 overflow-x-auto">
                          {gallery.slice(1).map((img, i) => (
                            <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-gray-200">
                              <ShowImage src={getDisplayImageUrl(img as string)} alt={`attachment-${i}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full aspect-video bg-slate-100 flex flex-col items-center justify-center gap-2 text-gray-300">
                      <ImageOff size={36} />
                      <span className="text-xs font-bold">ບໍ່ມີຮູບ</span>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Main info */}
              <Card className="shadow-sm border border-gray-100 rounded-3xl">
                <CardBody className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-lg font-bold text-gray-800">{report.title}</h1>
                    {status && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${status.className}`}>
                        {status.label}
                      </span>
                    )}
                  </div>

                  {report.description && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <FileText size={13} />
                        <span>ລາຍລະອຽດ / Description</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100" />

                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-[#075e3d] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{report.location}</p>
                        {place && <p className="text-xs text-gray-400">{place}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-[#075e3d] shrink-0" />
                      <span className="font-semibold">{formatDateTime(report.createdAt)}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
