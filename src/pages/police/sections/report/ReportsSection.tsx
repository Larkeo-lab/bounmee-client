import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  MapPin,
  Calendar,
  Send,
} from "lucide-react";
import { Card, CardBody, Skeleton } from "@heroui/react";

import {
  useGetReports,
  useForwardReport,
  ReportItem,
  ReportStatus,
} from "@/services/report/useReport";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";
import ReportDetailView, { STATUS_CONFIG } from "./reportDetail";

// Who each role forwards to (null = top, can't forward)
const FORWARD_LABEL: Record<string, string | null> = {
  VILLAGE_CHIEF: "ປກສ ເມືອง",
  DISTRICT_POLICE: "ກົມໃຫຍ່ຕຳຫຼວດ",
  POLICE_DEPARTMENT: null,
};



const FILTERS: { key: ReportStatus | ""; label: string }[] = [
  { key: "", label: "ທັງໝົດ" },
  { key: "PENDING", label: "ລໍຖ້າ" },
  { key: "IN_PROGRESS", label: "ກຳລັງດຳເນີນການ" },
  { key: "APPROVED", label: "ອະນຸມັດ" },
  { key: "REJECTED", label: "ປະຕິເສດ" },
  { key: "CANCELLED", label: "ຍົກເລີກ" },
];

export default function ReportsSection() {
  const [status, setStatus] = React.useState<ReportStatus | "">("");
  const [selected, setSelected] = React.useState<ReportItem | null>(null);

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
  const { mutateAsync: forwardReport, isPending: isForwarding } = useForwardReport();

  // POLICE_DEPARTMENT is the top level, so there is no one to forward to.
  const forwardTo = userType ? FORWARD_LABEL[userType] : null;

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
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-[280px]">
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

