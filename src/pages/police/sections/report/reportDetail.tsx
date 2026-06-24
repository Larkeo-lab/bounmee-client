import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Calendar,
  ImageOff,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Card, CardBody, Button, Skeleton } from "@heroui/react";

import { ReportItem, ReportStatus } from "@/services/report/useReport";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";
import { ShowImage } from "@/utils/showImage";

export const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "ລໍຖ້າດຳເນີນການ", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "ອະນຸມັດ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

// Display labels for each assignee level
export const ASSIGNEE_LABEL: Record<string, string> = {
  CITIZEN: "ປະຊາຊົນ",
  VILLAGE_CHIEF: "ນາຍບ້ານ",
  DISTRICT_POLICE: "ປກສ ເມືອง",
  POLICE_DEPARTMENT: "ກົມໃຫຍ່ຕຳຫຼວດ",
};

interface ReportDetailViewProps {
  report?: ReportItem | null;
  onBack: () => void;
  forwardTo?: string | null;
  onForward?: () => void;
  isForwarding?: boolean;
  isLoading?: boolean;
  // Optional actions (shown when handler is provided)
  onReceive?: () => void;
  onResolve?: () => void;
  isBusy?: boolean;
}

export default function ReportDetailView({
  report,
  onBack,
  forwardTo = null,
  onForward = () => {},
  isForwarding = false,
  isLoading = false,
  onReceive,
  onResolve,
  isBusy = false,
}: ReportDetailViewProps) {
  if (isLoading || !report) {
    return (
      <div className="space-y-4 max-w-7xl w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft size={16} /> ກັບຄືນ
        </button>

        {/* Province Badge Skeleton */}
        <Skeleton className="h-10 w-36 rounded-xl" />

        <Card className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden bg-white">
          {/* Centered Image Skeleton */}
          <div className="w-full bg-slate-50 flex items-center justify-center p-6 border-b border-gray-100 h-64">
            <Skeleton className="w-3/4 h-full rounded-lg" />
          </div>

          <CardBody className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-6 w-1/2 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>

            <div className="border-t border-gray-100" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-1/5 rounded-md" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Progress Bar Skeleton */}
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }
  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
  const place = [report.village?.nameLo, report.district?.nameLo, report.province?.nameLo]
    .filter(Boolean)
    .join(", ");
  const gallery = [report.image, ...(report.attachments || [])].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  );

  // Bottom progress bar status logic — based on the levels the report has
  // actually reached (escalation history + current level)
  const reached = new Set(
    [
      ...(report.history || []).map((h) => h.toAssignee),
      report.currentAssignee,
    ].filter(Boolean) as string[],
  );
  const isDistrictChecked =
    reached.has("DISTRICT_POLICE") || reached.has("POLICE_DEPARTMENT");
  const isVillageChecked = reached.has("VILLAGE_CHIEF") || isDistrictChecked;

  return (
    <div className="space-y-4 max-w-7xl w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <ArrowLeft size={16} /> ກັບຄືນ
      </button>

      {/* Province Badge */}
      <div className="bg-[#044e32] text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center shadow-sm w-fit">
        ນະຄອນຫຼວງວຽງຈັນ
      </div>

      <Card className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden bg-white">
        {/* Centered Image (from mockup) */}
        {gallery.length > 0 ? (
          <div className="w-full bg-slate-50 flex items-center justify-center p-6 border-b border-gray-100">
            <ShowImage
              src={getDisplayImageUrl(gallery[0] as string)}
              alt={report.title}
              className="max-h-64 object-contain rounded-lg shadow-sm"
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-slate-100 flex items-center justify-center text-gray-300">
            <ImageOff size={36} />
          </div>
        )}

        {gallery.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto border-b border-gray-100">
            {gallery.slice(1).map((img, i) => (
              <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-gray-200">
                <ShowImage src={getDisplayImageUrl(img as string)} alt={`att-${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <CardBody className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg font-bold text-gray-800">{report.title}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${st.className}`}>
              {st.label}
            </span>
          </div>

          {report.description && (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
          )}

          <div className="border-t border-gray-100" />

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={16} className="text-[#075e3d] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{report.location}</p>
                {place && <p className="text-xs text-gray-400">{place}</p>}
              </div>
            </div>

            {report.user && (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} className="text-[#075e3d] shrink-0" />
                  <span className="font-semibold">{report.user.userName || "-"}</span>
                </div>
                {report.user.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-[#075e3d] shrink-0" />
                    <span className="font-semibold">{report.user.phone}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} className="text-[#075e3d] shrink-0" />
              <span className="font-semibold">{formatDate(report.createdAt)}</span>
            </div>
          </div>

          {/* Escalation timeline (history) */}
          {report.history && report.history.length > 0 && (
            <>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">ປະຫວັດການສົ່ງຕໍ່ / History</p>
                <div className="space-y-3">
                  {report.history.map((h, i) => {
                    const isLast = i === report.history!.length - 1;

                    return (
                      <div key={h.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${isLast ? "bg-[#075e3d]" : "bg-gray-300"}`} />
                          {!isLast && <div className="w-0.5 flex-1 bg-gray-200" />}
                        </div>
                        <div className="pb-1 -mt-0.5">
                          <p className="text-sm font-bold text-gray-700">
                            {h.fromAssignee
                              ? `${ASSIGNEE_LABEL[h.fromAssignee] || h.fromAssignee} → ${ASSIGNEE_LABEL[h.toAssignee] || h.toAssignee}`
                              : `${ASSIGNEE_LABEL[h.toAssignee] || h.toAssignee}`}
                          </p>
                          <p className="text-[11px] text-gray-400">{formatDate(h.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Forward / status — show current level + forward button */}
          <div className="border-t border-gray-100 pt-2 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-[#075e3d] shrink-0" />
              <span className="text-gray-500">ປະຈຸບັນຢູ່ທີ່:</span>
              <span className="font-bold text-[#075e3d]">
                {report.currentAssignee ? ASSIGNEE_LABEL[report.currentAssignee] || report.currentAssignee : "-"}
              </span>
            </div>

            {onReceive || onResolve || forwardTo ? (
              <div className="flex flex-col sm:flex-row gap-2">
                {onReceive && (
                  <Button
                    startContent={<CheckCircle2 size={18} />}
                    isDisabled={isBusy}
                    onPress={onReceive}
                    className="flex-1 bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
                  >
                    {isBusy ? "ກຳລັງດຳເນີນ..." : "ຮັບເລື່ອງ"}
                  </Button>
                )}
                {forwardTo && (
                  <Button
                    startContent={<Send size={18} />}
                    isDisabled={isForwarding || isBusy}
                    onPress={onForward}
                    className="flex-1 bg-[#064e8a] hover:bg-[#053b6b] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
                  >
                    {isForwarding ? "ກຳລັງສົ່ງ..." : `ສົ່ງໃຫ້ ${forwardTo}`}
                  </Button>
                )}
                {onResolve && (
                  <Button
                    startContent={<CheckCircle2 size={18} />}
                    isDisabled={isBusy}
                    onPress={onResolve}
                    className="flex-1 bg-[#22a06b] hover:bg-[#1c8a5b] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
                  >
                    {isBusy ? "ກຳລັງດຳເນີນ..." : "ແກ້ໄຂສຳເລັດ"}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {/* Progress Bar (from mockup) */}
      <div className="w-full bg-[#d9d9d9] border border-gray-300 rounded-2xl p-4 pb-7 flex items-center justify-between relative mt-6 shadow-sm">
        {/* Step 1: ປະຊາຊົນ */}
        <div className="flex items-center gap-1.5 font-bold text-xs md:text-sm text-gray-800 shrink-0">
          <span>ປະຊາຊົນ</span>
          <CheckCircle2 size={18} className="text-emerald-600 fill-white shrink-0" />
        </div>

        {/* Connection 1 */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 relative min-w-[50px]">
          <div className={`w-full h-1 rounded ${isVillageChecked ? "bg-emerald-500" : "bg-black"}`} />
          {isVillageChecked && !isDistrictChecked && (
            <span className="text-[10px] md:text-xs font-bold text-blue-600 absolute top-2 whitespace-nowrap">
              ກຳລັງເກັບຫຼັກຖານ
            </span>
          )}
        </div>

        {/* Step 2: ນາຍບ້ານ */}
        <div className="flex items-center gap-1.5 font-bold text-xs md:text-sm text-gray-800 shrink-0">
          <span>ນາຍບ້ານ</span>
          {isVillageChecked ? (
            <CheckCircle2 size={18} className="text-emerald-600 fill-white shrink-0" />
          ) : (
            <div className="w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 bg-white" />
          )}
        </div>

        {/* Connection 2 */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 relative min-w-[50px]">
          <div className={`w-full h-1 rounded ${isDistrictChecked ? "bg-emerald-500" : "bg-black"}`} />
          {isDistrictChecked && (
            <span className="text-[10px] md:text-xs font-bold text-blue-600 absolute top-2 whitespace-nowrap">
              ກຳລັງດຳເນີນການ
            </span>
          )}
        </div>

        {/* Step 3: ປກສ ເມືອງ */}
        <div className="flex items-center gap-1.5 font-bold text-xs md:text-sm text-gray-800 shrink-0">
          <span>ປກສ ເມືອງ</span>
          {isDistrictChecked ? (
            <CheckCircle2 size={18} className="text-emerald-600 fill-white shrink-0" />
          ) : (
            <div className="w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}
