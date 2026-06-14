import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  FileText,
  MapPin,
  Calendar,
  ArrowLeft,
  User,
  Phone,
  ImageOff,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import {
  useGetReports,
  useForwardReport,
  ReportItem,
  ReportStatus,
  ReportFilters,
} from "@/services/report/useReport";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";

// Display labels for each assignee level
const ASSIGNEE_LABEL: Record<string, string> = {
  CITIZEN: "ປະຊາຊົນ",
  VILLAGE_CHIEF: "ນາຍບ້ານ",
  DISTRICT_POLICE: "ປກສ ເມືອง",
  POLICE_DEPARTMENT: "ກົມໃຫຍ່ຕຳຫຼວດ",
};

// Who each role forwards to (null = top, can't forward)
const FORWARD_LABEL: Record<string, string | null> = {
  VILLAGE_CHIEF: "ປກສ ເມືອง",
  DISTRICT_POLICE: "ກົມໃຫຍ່ຕຳຫຼວດ",
  POLICE_DEPARTMENT: null,
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "ລໍຖ້າດຳເນີນການ", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "ອະນຸມັດ", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "ປະຕິເສດ", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

const FILTERS: { key: ReportStatus | ""; label: string }[] = [
  { key: "", label: "ທັງໝົດ" },
  { key: "PENDING", label: "ລໍຖ້າ" },
  { key: "IN_PROGRESS", label: "ກຳລັງດຳເນີນການ" },
  { key: "APPROVED", label: "ອະນຸມັດ" },
  { key: "REJECTED", label: "ປະຕິເສດ" },
  { key: "CANCELLED", label: "ຍົກເລີກ" },
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

export default function ReportsSection() {
  const [tab, setTab] = React.useState<"current" | "history">("current");
  const [status, setStatus] = React.useState<ReportStatus | "">("");
  const [selected, setSelected] = React.useState<ReportItem | null>(null);

  // Scope reports by the logged-in user's area + level.
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const userType = account?.userType as string | undefined;

  const scope: ReportFilters = {};
  let myLevel: "VILLAGE_CHIEF" | "DISTRICT_POLICE" | "POLICE_DEPARTMENT" | undefined;
  if (userType === "VILLAGE_CHIEF") {
    scope.villageId = account?.villageId;
    myLevel = "VILLAGE_CHIEF";
  } else if (userType === "DISTRICT_POLICE") {
    scope.districtId = account?.districtId;
    myLevel = "DISTRICT_POLICE";
  } else if (userType === "POLICE_DEPARTMENT") {
    scope.provinceId = account?.provinceId;
    myLevel = "POLICE_DEPARTMENT";
  }

  if (myLevel) {
    // "current" = still in my queue; "history" = ever reached my level
    if (tab === "current") scope.currentAssignee = myLevel;
    else scope.reachedAssignee = myLevel;
  }

  const { data: reports = [], isLoading } = useGetReports({
    ...scope,
    ...(status ? { status } : {}),
    limit: 100,
  });

  const queryClient = useQueryClient();
  const { mutateAsync: forwardReport, isPending: isForwarding } = useForwardReport();

  // Forwarding only makes sense in the "current" queue (department = top, no next)
  const forwardTo = tab === "current" && userType ? FORWARD_LABEL[userType] : null;

  const doForward = async (id: string) => {
    try {
      await forwardReport(id);
      toast.success("ສົ່ງຕໍ່ສຳເລັດ");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setSelected(null);
    } catch (err) {
      console.error("Forward failed:", err);
      toast.error("ສົ່ງຕໍ່ບໍ່ສຳເລັດ");
    }
  };

  const handleForward = () => {
    if (selected) doForward(selected.id);
  };

  if (selected) {
    return (
      <ReportDetailView
        report={selected}
        onBack={() => setSelected(null)}
        forwardTo={forwardTo}
        onForward={handleForward}
        isForwarding={isForwarding}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Tabs: current queue vs history (reports that reached my level) */}
      <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
        <button
          onClick={() => setTab("current")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            tab === "current" ? "bg-[#075e3d] text-white" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ກ່ອງຮັບ
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            tab === "history" ? "bg-[#075e3d] text-white" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ປະຫວັດ
        </button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key || "all"}
            onClick={() => setStatus(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              status === f.key
                ? "bg-[#075e3d] text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="shadow-sm border border-gray-100 rounded-3xl">
          <CardBody className="p-10 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-500">ບໍ່ມີການແຈ້ງຄວາມ</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((r) => {
            const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.PENDING;

            return (
              <Card
                key={r.id}
                isPressable
                onPress={() => setSelected(r)}
                className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden w-full text-left active:scale-[0.99] transition-transform"
              >
                <CardBody className="p-0">
                  <div className="w-full aspect-video bg-slate-100">
                    {r.image ? (
                      <img
                        src={getDisplayImageUrl(r.image)}
                        alt={r.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/assets/logo.png"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FileText size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{r.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                      <MapPin size={11} className="shrink-0" /> {r.location}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                      <Calendar size={11} /> {formatDate(r.createdAt)}
                    </p>

                    {forwardTo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); doForward(r.id); }}
                        disabled={isForwarding}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 bg-[#075e3d] hover:bg-[#064e32] text-white text-xs font-bold rounded-xl py-2 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <Send size={14} /> ສົ່ງຕໍ່ໃຫ້ {forwardTo}
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReportDetailView({
  report,
  onBack,
  forwardTo,
  onForward,
  isForwarding,
}: {
  report: ReportItem;
  onBack: () => void;
  forwardTo: string | null;
  onForward: () => void;
  isForwarding: boolean;
}) {
  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
  const place = [report.village?.nameLo, report.district?.nameLo, report.province?.nameLo]
    .filter(Boolean)
    .join(", ");
  const gallery = [report.image, ...(report.attachments || [])].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <ArrowLeft size={16} /> ກັບຄືນ
      </button>

      <Card className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {gallery.length > 0 ? (
          <div className="w-full aspect-video bg-slate-100">
            <img src={getDisplayImageUrl(gallery[0] as string)} alt={report.title} className="w-full h-full object-cover" />
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
                <img src={getDisplayImageUrl(img as string)} alt={`att-${i}`} className="w-full h-full object-cover" />
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

            {forwardTo ? (
              <Button
                startContent={<Send size={18} />}
                isDisabled={isForwarding}
                onPress={onForward}
                className="w-full bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
              >
                {isForwarding ? "ກຳລັງສົ່ງ..." : `ສົ່ງຕໍ່ໃຫ້ ${forwardTo}`}
              </Button>
            ) : (
              <p className="text-xs text-gray-400 font-bold text-center">ຮອດຊັ້ນສູງສຸດແລ້ວ</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
