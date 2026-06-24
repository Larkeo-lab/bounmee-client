import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  Check,
  Send,
  Home as HomeIcon,
  Building2,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { ReportItem, ReportStatus } from "@/services/report/useReport";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "ບໍ່ທັນແກ້ໄຂ", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "ແກ້ໄຂແລ້ວ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

const ASSIGNEE_LABEL: Record<string, string> = {
  CITIZEN: "ປະຊາຊົນ",
  VILLAGE_CHIEF: "ນາຍບ້ານ",
  DISTRICT_POLICE: "ປກສ ເມືອງ",
  POLICE_DEPARTMENT: "ກົມໃຫຍ່ຕຳຫຼວດ",
};

interface Props {
  report: ReportItem;
  onBack: () => void;
  forwardTo?: string | null;
  onForward?: () => void;
  onReceive?: () => void;
  onResolve?: () => void;
  isBusy?: boolean;
}

// Police view (DISTRICT_POLICE / VILLAGE_CHIEF): full report + the citizen's
// extra info (ຂໍ້ມູນເພີ່ມເຕີມ) + actions (receive / forward / resolve).
export default function ReportAndMoreDetail({
  report,
  onBack,
  forwardTo = null,
  onForward = () => {},
  onReceive,
  onResolve,
  isBusy = false,
}: Props) {
  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
  const place = [report.district?.nameLo, report.province?.nameLo]
    .filter(Boolean)
    .join(", ");

  // Progress (reached levels from history + current)
  const reached = new Set(
    [
      ...(report.history || []).map((h) => h.toAssignee),
      report.currentAssignee,
    ].filter(Boolean) as string[],
  );
  const districtChecked =
    reached.has("DISTRICT_POLICE") || reached.has("POLICE_DEPARTMENT");
  const villageChecked = reached.has("VILLAGE_CHIEF") || districtChecked;

  const moreDetails = report.reportMoreDetail || [];

  return (
    <div className="space-y-5 max-w-6xl w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <ArrowLeft size={16} /> ກັບຄືນ
      </button>

      <div className="bg-[#044e32] text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center shadow-sm w-fit">
        ນະຄອນຫຼວງວຽງຈັນ
      </div>

      {/* Top: report + village + district cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Report card */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
          <div className="h-32 w-full bg-slate-100">
            {report.image ? (
              <img
                src={getDisplayImageUrl(report.image)}
                alt={report.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/assets/logo.png";
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
              <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{report.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${st.className}`}>
                {st.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">
              ແຈ້ງຄວາມໂດຍ: {report.user?.userName || "-"}
            </p>
            <p className="text-[10px] text-gray-400">{formatDate(report.createdAt)}</p>
          </div>
        </div>

        {/* Village card */}
        <InfoCard
          icon={<HomeIcon size={20} className="text-[#075e3d]" />}
          title={report.village?.nameLo ? `ບ້ານ${report.village.nameLo}` : "ບ້ານ —"}
          lines={[report.location || "-", formatDate(report.createdAt)]}
        />

        {/* District card */}
        <InfoCard
          icon={<Building2 size={20} className="text-[#075e3d]" />}
          title={report.district?.nameLo ? `ເມືອງ${report.district.nameLo}` : "ເມືອງ —"}
          lines={[report.province?.nameLo || "ນະຄອນຫຼວງວຽງຈັນ", formatDate(report.createdAt)]}
        />
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4 flex items-start">
        <Step label="ປະຊາຊົນ" sub="ສົ່ງແຈ້ງຄວາມແລ້ວ" done />
        <Line done={villageChecked} />
        <Step
          label="ນາຍບ້ານ"
          sub={villageChecked ? "ກຳລັງດຳເນີນງານ" : "ລໍຖ້າ"}
          done={villageChecked}
        />
        <Line done={districtChecked} />
        <Step
          label="ປກສ ເມືອງ"
          sub={districtChecked ? "ກຳລັງດຳເນີນງານ" : "ບໍ່ໄດ້ຮັບແຈ້ງຄວາມ"}
          done={districtChecked}
        />
      </div>

      {/* Detail + citizen extra info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: detail + history */}
        <Card className="shadow-sm border border-gray-100 rounded-2xl">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base text-gray-800">{report.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}>
                {st.label}
              </span>
            </div>
            {report.description && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.description}</p>
            )}

            <div className="border-t border-gray-100" />

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={15} className="text-[#075e3d] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{report.location}</p>
                  {place && <p className="text-xs text-gray-400">{place}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User size={15} className="text-[#075e3d] shrink-0" />
                <span className="font-semibold">{report.user?.userName || "-"}</span>
              </div>
              {report.user?.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={15} className="text-[#075e3d] shrink-0" />
                  <span className="font-semibold">{report.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={15} className="text-[#075e3d] shrink-0" />
                <span className="font-semibold">{formatDate(report.createdAt)}</span>
              </div>
            </div>

            {/* History timeline */}
            {report.history && report.history.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    ປະຫວັດການສົ່ງຕໍ່ / History
                  </p>
                  <div className="space-y-2">
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
                                : ASSIGNEE_LABEL[h.toAssignee] || h.toAssignee}
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

            <div className="border-t border-gray-100 pt-2 flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-[#075e3d] shrink-0" />
              <span className="text-gray-500">ປະຈຸບັນຢູ່ທີ່:</span>
              <span className="font-bold text-[#075e3d]">
                {report.currentAssignee ? ASSIGNEE_LABEL[report.currentAssignee] || report.currentAssignee : "-"}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Right: citizen extra info (read-only) */}
        <Card className="shadow-sm border border-gray-100 rounded-2xl">
          <CardBody className="p-5 space-y-3">
            <h4 className="font-bold text-sm text-gray-800 text-center">ຂໍ້ມູນເພີ່ມເຕີມ</h4>

            {moreDetails.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-10 text-gray-400">
                <FileText size={28} />
                <p className="text-xs font-bold">ຍັງບໍ່ມີຂໍ້ມູນເພີ່ມເຕີມ</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {moreDetails.map((m) => (
                  <div key={m.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                    {/* ເນື້ອໃນ */}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.detail}</p>

                    {/* ຮູບພາບ */}
                    {m.images && m.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.images.map((img) => (
                          <div key={img} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                            <img src={getDisplayImageUrl(img)} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ວິດີໂອ */}
                    {m.attachments && (
                      <video
                        src={getDisplayImageUrl(m.attachments)}
                        controls
                        className="w-full rounded-lg border border-gray-200 max-h-48"
                      />
                    )}

                    <p className="text-[10px] text-gray-400">{formatDate(m.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        {onReceive && (
          <Button
            startContent={<Check size={16} />}
            isDisabled={isBusy}
            onPress={onReceive}
            className="bg-[#22a06b] text-white font-bold rounded-xl px-6"
          >
            ຮັບເລື່ອງ
          </Button>
        )}
        {forwardTo && (
          <Button
            startContent={<Send size={16} />}
            isDisabled={isBusy}
            onPress={onForward}
            className="bg-[#064e8a] text-white font-bold rounded-xl px-6"
          >
            ສົ່ງໃຫ້ {forwardTo}
          </Button>
        )}
        {onResolve && (
          <Button
            startContent={<CheckCircle2 size={16} />}
            isDisabled={isBusy}
            onPress={onResolve}
            className="bg-[#075e3d] text-white font-bold rounded-xl px-6"
          >
            ແກ້ໄຂສຳເລັດ
          </Button>
        )}
        <Button
          variant="bordered"
          onPress={onBack}
          className="font-bold rounded-xl px-6 border-red-300 text-red-500"
        >
          ຍົກເລີກ
        </Button>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-2">
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

function Step({ label, sub, done }: { label: string; sub: string; done: boolean }) {
  return (
    <div className="flex flex-col items-center text-center shrink-0 w-24">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          done ? "bg-[#22a06b] text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        <Check size={16} />
      </div>
      <span className="text-sm font-bold text-gray-800 mt-1.5">{label}</span>
      <span className={`text-[11px] font-bold ${done ? "text-[#22a06b]" : "text-red-500"}`}>
        {sub}
      </span>
    </div>
  );
}

function Line({ done }: { done: boolean }) {
  return (
    <div className={`flex-1 h-1 rounded-full mt-3.5 ${done ? "bg-[#22a06b]" : "bg-gray-300"}`} />
  );
}
