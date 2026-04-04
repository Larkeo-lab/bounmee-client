import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery } from "@tanstack/react-query";

export interface Province {
  id: string;
  name: string;
  code: string;
}
export interface ProvinceFilters {
  limit?: number;
}

export const getAllProvinces = async (
  filter: ProvinceFilters = {},
): Promise<Province[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.PROVINCE.LIST, {
    params: { limit: filter.limit || 100 },
  });
  return response.data?.data || [];
};

export const useGetAllProvinces = () => {
  return useQuery({
    queryKey: ["provinces", 100],
    queryFn: () => getAllProvinces({ limit: 100 }),
  });
};
