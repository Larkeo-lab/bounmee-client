import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, MapPin, Calendar } from "lucide-react";
import { Skeleton, Card, CardBody } from "@heroui/react";

import {
  useGetVillageReports,
  ReportItem,
} from "@/services/report/useReport";
import { getDisplayImageUrl, formatDate } from "@/lib/utils";
import PoliceLayout from "@/layouts/PoliceLayout";
import ReportDetailView, { STATUS_CONFIG } from "../report/reportDetail";

export default function VillageReportPage() {
  const { villageId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<ReportItem | null>(null);

  const { data, isLoading } = useGetVillageReports(villageId);

  const village = data?.village;
  const reports = data?.reports || [];

  if (selected) {
    return (
      <PoliceLayout activeSection="police-district">
        <ReportDetailView
          report={selected}
          onBack={() => setSelected(null)}
          forwardTo={null}
          onForward={() => {}}
          isForwarding={false}
        />
      </PoliceLayout>
    );
  }

  return (
    <PoliceLayout activeSection="police-district">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Back + Province badge */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer w-fit"
          >
            <ArrowLeft size={16} /> ກັບຄືນ
          </button>
          <div className="bg-[#044e32] text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center shadow-sm w-fit">
            ນະຄອນຫຼວງວຽງຈັນ
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
          {isLoading ? (
            <Skeleton className="h-6 w-48 rounded-md" />
          ) : (
            <h2 className="text-lg font-bold text-gray-800">
              ການແຈ້ງຄວາມຂອງ ບ້ານ{village?.nameLo || "—"}
            </h2>
          )}
          <span className="text-xs font-bold text-[#075e3d] bg-[#075e3d]/10 px-3 py-1.5 rounded-full">
            ທັງໝົດ {data?.total ?? 0} ລາຍການ
          </span>
        </div>

        {/* Village info block */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
            <div className="space-y-2 md:flex md:flex-col md:items-end">
              <Skeleton className="h-3 w-16 rounded-md mb-1" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm text-sm font-bold text-gray-800">
            <div className="space-y-1.5">
              <p>ນາຍບ້ານ: {village?.chiefName || "ທ່ານ ....."} ເບີໂທ {village?.phone || "-"}</p>
              <p>ຮອງນາຍບ້ານ: {village?.deputyChiefName || "ທ່ານ ....."}</p>
              <p>ການແຈ້ງຄວາມທັງໝົດ: {data?.total ?? 0} ລາຍການ</p>
            </div>
            <div className="space-y-1.5 md:text-right">
              <p className="text-gray-400 uppercase tracking-wide text-xs">ສະຖານທີ່</p>
              <p>{village?.address || "-"}</p>
              <p className="text-gray-400 font-medium">{village?.email || ""}</p>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-[280px]">
                <Skeleton className="h-44 w-full shrink-0" />
                <div className="p-4 flex flex-col justify-between flex-grow space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <Skeleton className="h-3 w-1/3 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center text-center gap-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-10">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-500">
              ບໍ່ມີການແຈ້ງຄວາມໃນບ້ານນີ້
            </p>
          </div>
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
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PoliceLayout>
  );
}
