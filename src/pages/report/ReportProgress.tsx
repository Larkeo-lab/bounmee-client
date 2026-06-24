import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  Inbox,
  FileText,
  Check,
  Calendar,
  MapPin,
  User,
  Phone,
  Building2,
  Home as HomeIcon,
  ImagePlus,
  X,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardBody, Button } from "@heroui/react";

import {
  useGetReports,
  useUpdateReport,
  ReportItem,
  ReportStatus,
} from "@/services/report/useReport";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";
import { uploadImage } from "@/services/storage";
import ReportDetailView from "@/pages/police/sections/report/reportDetail";

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

// Tabs are status filters on the same page (empty statuses = show all)
const TABS: { key: string; label: string; statuses: ReportStatus[] }[] = [
  {
    key: "progress",
    label: "ຄວາມຄືບໜ້າແຈ້ງຄວາມ",
    statuses: ["PENDING", "IN_PROGRESS"],
  },
  { key: "resolved", label: "ແຈ້ງຄວາມແກ້ໄຂແລ້ວ", statuses: ["APPROVED"] },
  { key: "history", label: "ປະຫວັດແຈ້ງຄວາມ", statuses: [] },
];

export default function ReportProgress() {
  const navigate = useNavigate();
  const { user: authData } = useAuth();
  const userId = (authData as any)?.user?.id;

  const { data: reports = [], isLoading } = useGetReports({ userId });
  const [tab, setTab] = React.useState("progress");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];
  const filteredReports = activeTab.statuses.length
    ? reports.filter((r) => activeTab.statuses.includes(r.status))
    : reports;

  // Detail only appears after a box is clicked
  const selected = selectedId
    ? filteredReports.find((r) => r.id === selectedId) || null
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
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

      {/* Green Nav Bar */}
      <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>
        <span className="text-base font-bold tracking-wide">
          ຄວາມຄືບໜ້າແຈ້ງຄວາມ / Progress
        </span>
        <div className="w-9" />
      </nav>

      {/* Content */}
      <main className="flex-1 bg-[#d9d9d9] p-6 md:p-10">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Tabs — filter by status (same page) */}
          <div className="flex flex-wrap gap-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setSelectedId(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  t.key === tab
                    ? "bg-[#075e3d] text-white shadow"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

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
          ) : filteredReports.length === 0 ? (
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-10 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Inbox size={28} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-500">ບໍ່ມີຂໍ້ມູນໃນໝວດນີ້</p>
              </CardBody>
            </Card>
          ) : (tab === "history" || tab === "resolved") && selected ? (
            // History and Resolved tabs: show the full read-only detail view
            <ReportDetailView report={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <>
              {/* Reports (filtered by status) as a 4-column grid of boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`text-left rounded-2xl transition-all cursor-pointer ${
                      r.id === selectedId
                        ? "ring-2 ring-[#075e3d] ring-offset-2"
                        : "hover:shadow-md"
                    }`}
                  >
                    <ReportMiniCard report={r} />
                  </button>
                ))}
              </div>

              {/* Detail of the selected report */}
              {selected && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-6 space-y-6">
                  {/* Village + district info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoMiniCard
                      icon={<HomeIcon size={20} className="text-[#075e3d]" />}
                      title={selected.village?.nameLo ? `ບ້ານ${selected.village.nameLo}` : "ບ້ານ —"}
                      lines={[selected.location || "-", formatDate(selected.createdAt)]}
                    />
                    <InfoMiniCard
                      icon={<Building2 size={20} className="text-[#075e3d]" />}
                      title={selected.district?.nameLo ? `ເມືອງ${selected.district.nameLo}` : "ເມືອງ —"}
                      lines={[selected.province?.nameLo || "ນະຄອນຫຼວງວຽງຈັນ", formatDate(selected.createdAt)]}
                    />
                  </div>

                  {/* Progress stepper */}
                  <ReportProgressBar report={selected} />

                  {/* Detail + add-info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <ReportDetailCard report={selected} />
                    <AddInfoForm report={selected} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}

function ReportMiniCard({ report }: { report: ReportItem }) {
  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
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
          <h5 className="font-bold text-sm text-gray-800 line-clamp-1">{report.title}</h5>
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
function ReportProgressBar({ report }: { report: ReportItem }) {
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
      sub: reached.has("VILLAGE_CHIEF") ? "ແຈ້ງຄວາມເຂົ້າ" : "ລໍຖ້າ",
      done: reached.has("VILLAGE_CHIEF"),
    },
    {
      label: "ປກສ ເມືອງ",
      sub: reached.has("DISTRICT_POLICE") ? "ແຈ້ງຄວາມເຂົ້າ" : "ບໍ່ໄດ້ຮັບແຈ້ງຄວາມ",
      done: reached.has("DISTRICT_POLICE"),
    },
  ];

  return (
    <div className="flex items-start border border-gray-200 rounded-2xl p-4">
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
            <span className="text-sm font-bold text-gray-800 mt-1.5">{s.label}</span>
            <span
              className={`text-[11px] font-bold ${s.done ? "text-[#22a06b]" : "text-red-500"}`}
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

function ReportDetailCard({ report }: { report: ReportItem }) {
  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
  const history = report.history || [];

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-base text-gray-800">{report.title}</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${st.className}`}>
          {st.label}
        </span>
      </div>

      {report.description && (
        <p className="text-xs text-gray-500 font-medium">{report.description}</p>
      )}

      <div className="space-y-1.5 text-xs font-medium text-gray-600">
        <p className="flex items-center gap-2">
          <MapPin size={13} className="text-[#075e3d] shrink-0" /> {report.location || "-"}
        </p>
        <p className="flex items-center gap-2">
          <User size={13} className="text-[#075e3d] shrink-0" /> {report.user?.userName || "-"}
        </p>
        <p className="flex items-center gap-2">
          <Phone size={13} className="text-[#075e3d] shrink-0" /> {report.user?.phone || "-"}
        </p>
        <p className="flex items-center gap-2">
          <Calendar size={13} className="text-[#075e3d] shrink-0" /> {formatDate(report.createdAt)}
        </p>
      </div>

      {/* History timeline */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-500 mb-2">ປະຫວັດການສົ່ງຕໍ່ / HISTORY</p>
        {history.length === 0 ? (
          <p className="text-xs text-gray-400">ຍັງບໍ່ມີ</p>
        ) : (
          <div className="space-y-2.5">
            {history.map((h, i) => {
              const last = i === history.length - 1;
              const label = h.fromAssignee
                ? `${ASSIGNEE_LABEL[h.fromAssignee] || h.fromAssignee} → ${ASSIGNEE_LABEL[h.toAssignee] || h.toAssignee}`
                : ASSIGNEE_LABEL[h.toAssignee] || h.toAssignee;

              return (
                <div key={h.id || i} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 ${last ? "bg-[#075e3d]" : "bg-gray-300"}`} />
                    {!last && <div className="w-0.5 flex-1 bg-gray-200" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-xs font-bold text-gray-700">{label}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(h.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {report.currentAssignee && (
          <p className="text-xs font-bold text-gray-600 mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
            <Check size={13} className="text-[#22a06b]" />
            ປະຈຸບັນຢູ່ທີ່:{" "}
            <span className="text-[#075e3d]">
              {ASSIGNEE_LABEL[report.currentAssignee] || report.currentAssignee}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

// "ແຈ້ງຂໍ້ມູນເພີ່ມເຕີມ" — append a note + extra image(s) to the report (non-destructive)
function AddInfoForm({ report }: { report: ReportItem }) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateReport, isPending } = useUpdateReport();

  const [note, setNote] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const inputClass =
    "border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition";

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const names = await Promise.all(files.map((f) => uploadImage(f)));
      setImages((prev) => [...prev, ...names]);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const reset = () => {
    setNote("");
    setImages([]);
  };

  const handleSubmit = async () => {
    if (!note.trim() && images.length === 0) {
      return toast.error("ກະລຸນາໃສ່ຂໍ້ມູນ ຫຼື ຮູບພາບ");
    }
    try {
      const stamp = formatDate(new Date().toISOString());
      const appended = report.description
        ? `${report.description}\n— [ເພີ່ມເຕີມ ${stamp}] ${note.trim()}`
        : note.trim();

      await updateReport({
        id: report.id,
        payload: {
          ...(note.trim() ? { description: appended } : {}),
          attachments: [...(report.attachments || []), ...images],
        },
      });
      toast.success("ສົ່ງຂໍ້ມູນເພີ່ມເຕີມສຳເລັດ");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      reset();
    } catch (err: any) {
      console.error("Add info failed:", err);
      toast.error(err?.response?.data?.message || "ສົ່ງຂໍ້ມູນບໍ່ສຳເລັດ");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <h4 className="font-bold text-sm text-gray-800 text-center">ແຈ້ງຂໍ້ມູນເພີ່ມເຕີມ</h4>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="ໃສ່ຂໍ້ມູນທີ່ຕ້ອງການແຈ້ງ..."
        className={`${inputClass} w-full resize-none`}
      />

      {/* Uploaded image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((name) => (
            <div key={name} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              <img src={getDisplayImageUrl(name)} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setImages((prev) => prev.filter((n) => n !== name))}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload box */}
      <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl py-5 cursor-pointer hover:border-[#075e3d]/50 transition-colors">
        <input type="file" accept="image/*" multiple className="hidden" onChange={handlePick} disabled={uploading} />
        {uploading ? (
          <Loader2 size={20} className="text-[#075e3d] animate-spin" />
        ) : (
          <ImagePlus size={20} className="text-gray-400" />
        )}
        <span className="text-xs font-bold text-gray-500">
          {uploading ? "ກຳລັງອັບໂຫຼດ..." : "ຮູບພາບ"}
        </span>
      </label>

      <div className="flex gap-3 pt-1">
        <Button
          onPress={handleSubmit}
          isDisabled={isPending || uploading}
          className="flex-1 bg-[#22a06b] text-white font-bold rounded-xl"
        >
          <Send size={15} /> {isPending ? "ກຳລັງສົ່ງ..." : "ສົ່ງຂໍ້ມູນ"}
        </Button>
        <Button
          onPress={reset}
          variant="bordered"
          className="flex-1 font-bold rounded-xl border-red-300 text-red-500"
        >
          ຍົກເລີກ
        </Button>
      </div>
    </div>
  );
}
