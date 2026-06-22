import { useAuth } from "@/routes/AuthContext";
import { useGetPoliceDistrictByIdAndReports } from "@/services/police-district/usePoliceDistrict";
import VillageList from "./villageList";

// DISTRICT_POLICE home: the villages (+ per-village report counts) of their own district.
export default function MyDistrictSection() {
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const districtId = account?.districtId as string | undefined;

  const { data: detail, isLoading } =
    useGetPoliceDistrictByIdAndReports(districtId);

  if (!districtId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-bold text-gray-500">
          ບັນຊີນີ້ຍັງບໍ່ໄດ້ກຳນົດເມືອງ
        </p>
      </div>
    );
  }

  return <VillageList district={detail || {}} isLoading={isLoading} />;
}
