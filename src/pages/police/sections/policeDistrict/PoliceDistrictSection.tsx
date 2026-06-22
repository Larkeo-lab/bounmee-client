import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search } from "lucide-react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { useGetPoliceDepartmentsAndReports } from "@/services/police-district/usePoliceDistrict";
import { getDisplayImageUrl } from "@/lib/utils";

export default function PoliceDistrictSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  // POLICE_DEPARTMENT view: all districts in the department's province
  const { data: districts = [], isLoading } = useGetPoliceDepartmentsAndReports();

  // Filter districts based on search query
  const filteredDistricts = districts.filter((d) =>
    (d.districtName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Province badge and page stats */}
      <div className="space-y-3">
        <div className="bg-[#044e32] text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center shadow-sm">
          ນະຄອນຫຼວງວຽງຈັນ
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base font-bold text-gray-800">
            ປກສ ເມືອງທັງໝົດມີ: {districts.length} ຫ້ອງການ
          </h2>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          placeholder="ຄົ້ນຫາ...."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition shadow-sm"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
      </div>

      {isLoading && districts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[280px]"
            >
              {/* Image Skeleton */}
              <Skeleton className="h-44 w-full shrink-0" />
              {/* Content Skeleton */}
              <div className="p-4 flex flex-col justify-between flex-grow relative bg-white border-t border-gray-100">
                <div className="space-y-2 flex flex-col items-center">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <Skeleton className="h-3.5 w-1/2 rounded-md" />
                  <Skeleton className="h-3 w-1/3 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDistricts.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <Card className="shadow-sm border border-gray-100 rounded-3xl w-full max-w-md">
            <CardBody className="p-10 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 size={28} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-500">
                ບໍ່ພົບຂໍ້ມູນ ປກສ ເມືອງ
              </p>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDistricts.map((d) => {
            // Check if special date formatting is needed (e.g. blue underlined in mockup)
            const isSpecialDate = d.districtName === "ເມືອງສັງທອງ";

            return (
              <div
                key={d.id}
                onClick={() =>
                  navigate(`/police/police-district/${d.id}`, {
                    state: { district: d },
                  })
                }
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group relative transition-all duration-300 hover:shadow-md cursor-pointer animate-fade-in"
              >
                {/* Red Notification Badge (Absolute Top Right of Card) */}
                {d.badgeCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-[#d32f2f] text-white text-xs font-bold rounded-lg px-2.5 py-1 flex items-center justify-center shadow-md z-20">
                    {d.badgeCount}
                  </div>
                )}

                {/* Image Container */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={getDisplayImageUrl(d.imageUrl) || "/assets/logo.png"}
                    alt={d.districtName}
                    onError={(e) => {
                      e.currentTarget.src = "/assets/logo.png";
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col justify-between flex-grow relative bg-white border-t border-gray-100">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-gray-800 text-center leading-tight">
                      {d.districtName}
                    </h3>
                    <div className="pt-1.5 border-t border-gray-50 space-y-0.5">
                      <p className="text-xs font-bold text-gray-500">
                        ມີບ້ານທັງໝົດ {d.villageCount} ບ້ານ
                      </p>
                      <p
                        className={`text-xs font-bold ${isSpecialDate ? "text-[#0066cc] underline cursor-pointer" : "text-gray-500"}`}
                      >
                        ລ່າສຸດ: {d.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
