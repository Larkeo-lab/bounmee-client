import { useMutation, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface PoliceDistrictUser {
  id: string;
  userName?: string | null;
  email?: string | null;
  phone?: string | null;
  provinceId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  address?: string | null;
  userType?: string;
  isActive?: boolean;
}

export interface PoliceDistrictItem {
  id: string;
  chiefName: string;
  deputyChiefName: string;
  createdAt: string;
  updatedAt: string;
  users?: PoliceDistrictUser[];
}

// Matches server policeDistrictCreateSchema
export interface CreatePoliceDistrictPayload {
  chiefName: string;
  deputyChiefName: string;
  userName: string;
  password: string;
  email?: string | null;
  phone?: string | null;
  provinceId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  address?: string | null;
}

export interface UpdatePoliceDistrictPayload {
  chiefName?: string;
  deputyChiefName?: string;
  userName?: string;
  password?: string;
  email?: string | null;
  phone?: string | null;
  provinceId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  address?: string | null;
}

export const getPoliceDistricts = async (): Promise<PoliceDistrictItem[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.POLICE_DISTRICT.LIST, {
    params: { limit: 100 },
  });

  return response.data?.data || [];
};

export const useGetPoliceDistricts = () => {
  return useQuery({
    queryKey: ["police-districts"],
    queryFn: getPoliceDistricts,
  });
};

export const createPoliceDistrict = async (
  payload: CreatePoliceDistrictPayload,
) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.POLICE_DISTRICT.CREATE,
    payload,
  );

  return response.data?.data;
};

export const useCreatePoliceDistrict = () => {
  return useMutation({ mutationFn: createPoliceDistrict });
};

export const updatePoliceDistrict = async (
  id: string,
  payload: UpdatePoliceDistrictPayload,
) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.POLICE_DISTRICT.UPDATE(id),
    payload,
  );

  return response.data?.data;
};

export const useUpdatePoliceDistrict = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePoliceDistrictPayload }) =>
      updatePoliceDistrict(id, payload),
  });
};

export const deletePoliceDistrict = async (id: string) => {
  const response = await axiosInstance.delete(
    API_ENDPOINTS.POLICE_DISTRICT.DELETE(id),
  );

  return response.data?.data;
};

export const useDeletePoliceDistrict = () => {
  return useMutation({ mutationFn: deletePoliceDistrict });
};
