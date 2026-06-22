import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Skeleton } from "@heroui/react";
import { useGetPoliceDistrictByIdAndReports } from "@/services/police-district/usePoliceDistrict";
import VillageList from "./sections/policeDistrict/villageList";
import PoliceLayout from "@/layouts/PoliceLayout";

export default function PoliceDistrictVillages() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Card item passed on click — used for an instant header while the detail loads
  const stateDistrict = (location.state as any)?.district;
  const { data: detail, isLoading } =
    useGetPoliceDistrictByIdAndReports(districtId);

  const district = detail || stateDistrict;

  const goBack = () => navigate("/police/home?section=police-district");

  if (!district) {
    if (isLoading) {
      return (
        <PoliceLayout activeSection="police-district">
          <div className="space-y-6">
            {/* Back button and Province Badge Skeleton */}
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>

            {/* District Info Block Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm">
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

            {/* Subtitle Skeleton */}
            <div className="flex justify-center">
              <Skeleton className="h-6 w-64 rounded-md" />
            </div>

            {/* Search Bar Skeleton */}
            <Skeleton className="h-10 w-full max-w-xs rounded-xl" />

            {/* Village Grid Skeleton */}
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
          </div>
        </PoliceLayout>
      );
    }

    return (
      <PoliceLayout activeSection="police-district">
        <div className="flex items-center justify-center py-24">
          <p className="text-sm font-bold text-gray-500">ບໍ່ພົບຂໍ້ມູນ ປກສ ເມືອງ</p>
        </div>
      </PoliceLayout>
    );
  }

  return (
    <PoliceLayout activeSection="police-district">
      <VillageList district={district} onBack={goBack} isLoading={isLoading} />
    </PoliceLayout>
  );
}
