import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface District {
  id: string;
  code: string;
  nameLo: string;
  nameEn: string;
  provinceCode: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const getDistrictsByProvince = async (
  provinceCode: string,
): Promise<District[]> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.DISTRICT.BY_PROVINCE(provinceCode),
  );

  return response.data?.data || [];
};

export const useGetDistrictsByProvince = (provinceCode?: string) => {
  return useQuery({
    queryKey: ["districts", provinceCode],
    queryFn: () => getDistrictsByProvince(provinceCode!),
    enabled: !!provinceCode,
  });
};

// Fetch every district (no province filter)
export const getAllDistricts = async (): Promise<District[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.DISTRICT.LIST, {
    params: { limit: 1000 },
  });

  return response.data?.data || [];
};

export const useGetAllDistricts = () => {
  return useQuery({
    queryKey: ["districts", "all"],
    queryFn: getAllDistricts,
  });
};
