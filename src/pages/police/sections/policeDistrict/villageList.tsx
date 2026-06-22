import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Skeleton } from "@heroui/react";

interface Village {
  id: string;
  name: string;
  badge?: number;
  index: number;
}

interface VillageListProps {
  district: any;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function VillageList({
  district,
  onBack,
  isLoading,
}: VillageListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Real villages of this district, each with its report count (from the API).
  // Names are stored without the "ບ້ານ" prefix, so add it for display.
  const villages: Village[] = (district.villages || []).map(
    (v: any, index: number) => ({
      id: v.id,
      name: `ບ້ານ${v.nameLo}`,
      badge: v.reportCount ?? 0,
      index: index + 1,
    }),
  );

  // Filter villages based on search query
  const filteredVillages = villages.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Distribute filtered villages evenly across 3 columns
  const perColumn = Math.ceil(filteredVillages.length / 3);
  const col1 = filteredVillages.slice(0, perColumn);
  const col2 = filteredVillages.slice(perColumn, perColumn * 2);
  const col3 = filteredVillages.slice(perColumn * 2);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Back button and Province Badge */}
      <div className="flex flex-col gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer w-fit"
          >
            <ArrowLeft size={16} /> ກັບຄືນ
          </button>
        )}
        <div className="bg-[#044e32] text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center shadow-sm w-fit">
          ນະຄອນຫຼວງວຽງຈັນ
        </div>
      </div>

      {/* District Info Block */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm text-sm font-bold">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="space-y-2 md:flex md:flex-col md:items-end">
            <Skeleton className="h-3 w-16 rounded-md mb-1" />
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm text-sm font-bold text-gray-800">
          <div className="space-y-1.5">
            <p>
              ຫົວໜ້າຫ້ອງການ: {district.chiefName || "ທ່ານ ....."} ເບີໂທ{" "}
              {district.phone || district.users?.[0]?.phone || "-"}
            </p>
            <p>ຮັກສາການແທນ: {district.deputyChiefName || "ທ່ານ ....."}</p>
            <p>ການແຈ້ງຄວາມທັງໝົດ: {district.totalReports ?? 0} ລາຍการ</p>
          </div>
          <div className="space-y-1.5 md:text-right">
            <p className="text-gray-400 uppercase tracking-wide text-xs">
              ສະຖານທີ່
            </p>
            <p>
              {(district.address || district.users?.[0]?.address)?.split(
                ",",
              )?.[0] || "-"}
            </p>
            <p>
              {(district.address || district.users?.[0]?.address)?.split(
                ",",
              )?.[1] || ""}
            </p>
          </div>
        </div>
      )}

      {/* Subtitle */}
      <div className="text-center text-lg font-bold text-gray-800 flex justify-center">
        {isLoading ? (
          <Skeleton className="h-6 w-64 rounded-md" />
        ) : (
          `ນະຄອນຫຼວງວຽງຈັນ→${district.districtName}ມີ: ${district.villageCount ?? 0}ໝູ່ບ້ານ`
        )}
      </div>

      {/* Search Bar */}
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

      {/* Village Columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          {/* Column 1 */}
          <div className="flex flex-col items-start gap-4 pb-6 md:pb-0 md:pr-6 border-b md:border-b-0 md:border-r border-gray-200">
            <Skeleton className="h-10 w-[200px] rounded-xl" />
            <Skeleton className="h-10 w-[200px] rounded-xl" />
            <Skeleton className="h-10 w-[200px] rounded-xl" />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-start gap-4 py-6 md:py-0 md:px-6 border-b md:border-b-0 md:border-r border-gray-200">
            <Skeleton className="h-10 w-[200px] rounded-xl" />
            <Skeleton className="h-10 w-[200px] rounded-xl" />
            <Skeleton className="h-10 w-[200px] rounded-xl" />
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-start gap-4 pt-6 md:pt-0 md:pl-6">
            <Skeleton className="h-10 w-[200px] rounded-xl" />
            <Skeleton className="h-10 w-[200px] rounded-xl" />
            <Skeleton className="h-10 w-[200px] rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 min-h-[400px] pt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          {/* Column 1 */}
          <div className="flex flex-col items-start gap-4 pb-6 md:pb-0 md:pr-6 border-b md:border-b-0 md:border-r border-gray-200">
            {col1.map((v) => (
              <VillageBadge
                key={v.id}
                index={v.index}
                name={v.name}
                badge={v.badge}
                onClick={() => navigate(`/police/village/${v.id}/reports`)}
              />
            ))}
            {col1.length === 0 && (
              <p className="text-sm font-bold text-gray-400">ບໍ່ມີຂໍ້ມູນ</p>
            )}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-start gap-4 py-6 md:py-0 md:px-6 border-b md:border-b-0 md:border-r border-gray-200">
            {col2.map((v) => (
              <VillageBadge
                key={v.id}
                index={v.index}
                name={v.name}
                badge={v.badge}
                onClick={() => navigate(`/police/village/${v.id}/reports`)}
              />
            ))}
            {col2.length === 0 && (
              <p className="text-sm font-bold text-gray-400">ບໍ່ມີຂໍ້ມູນ</p>
            )}
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-start gap-4 pt-6 md:pt-0 md:pl-6">
            {col3.map((v) => (
              <VillageBadge
                key={v.id}
                index={v.index}
                name={v.name}
                badge={v.badge}
                onClick={() => navigate(`/police/village/${v.id}/reports`)}
              />
            ))}
            {col3.length === 0 && (
              <p className="text-sm font-bold text-gray-400">ບໍ່ມີຂໍ້ມູນ</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VillageBadge({
  index,
  name,
  badge,
  onClick,
}: {
  index: number;
  name: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <div className="relative inline-flex">
      <button
        onClick={onClick}
        className="bg-[#044e32] hover:bg-[#033a25] text-white font-bold text-sm px-6 py-2.5 rounded-xl cursor-pointer shadow transition-all duration-200 active:scale-95 text-center whitespace-nowrap min-w-[200px]"
      >
        {index}. {name}
      </button>
      {badge !== undefined && badge !== null ? (
        <span
          className={`absolute -top-1.5 -right-1.5 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
            badge > 0 ? "bg-[#d32f2f]" : "bg-gray-400"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}
