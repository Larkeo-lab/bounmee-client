import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface Village {
  id: string;
  code: string;
  nameLo: string;
  nameEn: string;
  districtCode: string;
}

export const getVillagesByDistrict = async (
  districtCode: string,
): Promise<Village[]> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.VILLAGE.BY_DISTRICT(districtCode),
    // Default page size is 10 — request enough to cover every village in a
    // district (largest has ~54). 100 is the server-side max.
    { params: { limit: 100 } },
  );

  return response.data?.data || [];
};

export const useGetVillagesByDistrict = (districtCode?: string) => {
  return useQuery({
    queryKey: ["villages", districtCode],
    queryFn: () => getVillagesByDistrict(districtCode!),
    enabled: !!districtCode,
  });
};
