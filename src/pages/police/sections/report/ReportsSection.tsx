import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardBody, Skeleton } from "@heroui/react";

import {
  useGetReports,
  useForwardReport,
  useReceiveReport,
  useResolveReport,
  ReportItem,
  ReportStatus,
} from "@/services/report/useReport";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";
import { STATUS_CONFIG } from "./reportDetail";
import ReportAndMoreDetail from "./reportAndMoreDetail";

// Who each role forwards to (null = top, can't forward)
const FORWARD_LABEL: Record<string, string | null> = {
  VILLAGE_CHIEF: "ປກສ ເມືອง",
  DISTRICT_POLICE: "ກົມໃຫຍ່ຕຳຫຼວດ",
  POLICE_DEPARTMENT: null,
};

const FILTERS: { key: ReportStatus | ""; label: string }[] = [
  { key: "PENDING", label: "ເຂົ້າໃໝ່" },
  { key: "IN_PROGRESS", label: "ກຳລັງດຳເນີນການ" },
  { key: "APPROVED", label: "ອະນຸມັດ" },
  { key: "", label: "ທັງໝົດ" },
];

interface ReportsSectionProps {
  selected?: ReportItem | null;
  onSelect?: (report: ReportItem | null) => void;
}

export default function ReportsSection({
  selected: propSelected,
  onSelect,
}: ReportsSectionProps = {}) {
  const [status, setStatus] = React.useState<ReportStatus | "">("PENDING");
  const [localSelected, setLocalSelected] = React.useState<ReportItem | null>(
    null,
  );

  const selected = onSelect ? (propSelected ?? null) : localSelected;
  const setSelected = onSelect ? onSelect : setLocalSelected;

  // Scope reports by the logged-in user's level (same as the policeDistrict section):
  //  POLICE_DEPARTMENT → whole province, DISTRICT_POLICE → own district, VILLAGE_CHIEF → own village
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const userType = account?.userType as string | undefined;

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
    ...(status ? { status } : {}),
    limit: 100,
  });

  const queryClient = useQueryClient();
  const { mutateAsync: forwardReport, isPending: isForwarding } =
    useForwardReport();
  const { mutateAsync: receiveReport, isPending: isReceiving } =
    useReceiveReport();
  const { mutateAsync: resolveReport, isPending: isResolving } =
    useResolveReport();
  const isBusy = isForwarding || isReceiving || isResolving;

  // Keep the open detail in sync with freshly-fetched data after a mutation
  const liveSelected = selected
    ? reports.find((r) => r.id === selected.id) || selected
    : null;

  // Available actions for a report, based on the viewer's role + report state.
  // POLICE_DEPARTMENT = view only.
  const getActions = (r: ReportItem) => {
    if (r.status === "APPROVED") return {};
    if (userType === "VILLAGE_CHIEF") {
      if (r.currentAssignee === "CITIZEN") return { receive: true };
      if (r.currentAssignee === "VILLAGE_CHIEF")
        return { forward: FORWARD_LABEL.VILLAGE_CHIEF, resolve: true };
      return {};
    }
    if (userType === "DISTRICT_POLICE") {
      if (r.currentAssignee === "DISTRICT_POLICE")
        return r.status === "PENDING"
          ? { receive: true }
          : { resolve: true };
      return {};
    }
    return {};
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["reports"] });

  const doReceive = async (r: ReportItem) => {
    try {
      await receiveReport(r.id);
      toast.success("ຮັບເລື່ອງສຳເລັດ");
      refresh();
      setSelected(r); // open detail after receiving
    } catch (err: any) {
      console.error("Receive failed:", err);
      toast.error(err?.response?.data?.message || "ຮັບເລື່ອງບໍ່ສຳເລັດ");
    }
  };

  const doForward = async (r: ReportItem) => {
    try {
      await forwardReport(r.id);
      toast.success("ສົ່ງຕໍ່ສຳເລັດ");
      refresh();
    } catch (err: any) {
      console.error("Forward failed:", err);
      toast.error(err?.response?.data?.message || "ສົ່ງຕໍ່ບໍ່ສຳເລັດ");
    }
  };

  const doResolve = async (
    r: ReportItem,
    payload?: { evidenceDetail?: string; caseConclusion?: string },
  ) => {
    try {
      await resolveReport({ id: r.id, payload });
      toast.success("ບັນທຶກການແກ້ໄຂສຳເລັດ");
      refresh();
      setSelected(null);
    } catch (err: any) {
      console.error("Resolve failed:", err);
      toast.error(err?.response?.data?.message || "ບໍ່ສຳເລັດ");
    }
  };

  if (liveSelected) {
    const a = getActions(liveSelected);

    return (
      <ReportAndMoreDetail
        report={liveSelected}
        onBack={() => setSelected(null)}
        forwardTo={a.forward || null}
        onForward={() => doForward(liveSelected)}
        onReceive={a.receive ? () => doReceive(liveSelected) : undefined}
        onResolve={a.resolve ? (payload) => doResolve(liveSelected, payload) : undefined}
        isBusy={isBusy}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-[280px]"
            >
              <Skeleton className="h-44 w-full shrink-0" />
              <div className="p-4 flex flex-col justify-between flex-grow space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-1/2 rounded-md" />
                <Skeleton className="h-3 w-1/3 rounded-md" />
              </div>
            </div>
          ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        onError={(e) => {
                          e.currentTarget.src = "/assets/logo.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FileText size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
                        {r.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                      <MapPin size={11} className="shrink-0" /> {r.location}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                      <Calendar size={11} /> {formatDate(r.createdAt)}
                    </p>

                    {getActions(r).receive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          doReceive(r);
                        }}
                        disabled={isBusy}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 bg-[#075e3d] hover:bg-[#064e32] text-white text-xs font-bold rounded-xl py-2 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 size={14} /> ຮັບເລື່ອງ
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
