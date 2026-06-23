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
  image?: string | null;
  bgImage?: string | null;
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
  image?: string | null;
  bgImage?: string | null;
  userName?: string;
  password?: string;
  email?: string | null;
  phone?: string | null;
  provinceCode?: string | null;
  districtCode?: string | null;
  villageCode?: string | null;
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

// Detail (for prefilling the profile form)
export const getPoliceDistrict = async (
  id: string,
): Promise<PoliceDistrictItem | null> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.POLICE_DISTRICT.DETAIL(id),
  );
  return response.data?.data || null;
};

export const useGetPoliceDistrict = (id?: string) => {
  return useQuery({
    queryKey: ["police-district", id],
    queryFn: () => getPoliceDistrict(id!),
    enabled: !!id,
  });
};

// Self-profile update (DISTRICT_POLICE updates their own office)
export const updateMyPoliceDistrict = async (
  payload: UpdatePoliceDistrictPayload,
) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.POLICE_DISTRICT.UPDATE_ME,
    payload,
  );
  return response.data?.data;
};

export const useUpdateMyPoliceDistrict = () => {
  return useMutation({ mutationFn: updateMyPoliceDistrict });
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

export const getPoliceDistrictsAndReports = async (): Promise<any[]> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.POLICE_DISTRICT.REPORTS_LIST,
  );
  return response.data?.data || [];
};

export const useGetPoliceDistrictsAndReports = (options?: any) => {
  return useQuery<any[]>({
    queryKey: ["police-districts-and-reports"],
    queryFn: getPoliceDistrictsAndReports,
    ...options,
  });
};

// POLICE_DEPARTMENT (province level): every district in the dept's province + reports
export const getPoliceDepartmentsAndReports = async (): Promise<any[]> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.POLICE_DISTRICT.DEPARTMENT_REPORTS_LIST,
  );
  return response.data?.data || [];
};

export const useGetPoliceDepartmentsAndReports = (options?: any) => {
  return useQuery<any[]>({
    queryKey: ["police-departments-and-reports"],
    queryFn: getPoliceDepartmentsAndReports,
    ...options,
  });
};



export interface DistrictVillageReport {
  id: string;
  code: string;
  nameLo: string;
  nameEn?: string;
  reportCount: number;
  pendingCount: number;
}

export interface PoliceDistrictDetail {
  id: string;
  districtName: string;
  districtNameEn?: string;
  chiefName: string;
  deputyChiefName: string;
  phone: string;
  address: string;
  imageUrl: string;
  villageCount: number;
  totalReports: number;
  villages: DistrictVillageReport[];
}

// District detail by District id: villages + per-village report counts
export const getPoliceDistrictByIdAndReports = async (
  id: string,
): Promise<PoliceDistrictDetail | null> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.POLICE_DISTRICT.VILLAGES_REPORTS(id),
  );
  return response.data?.data || null;
};

export const useGetPoliceDistrictByIdAndReports = (id?: string) => {
  return useQuery({
    queryKey: ["police-district-villages", id],
    queryFn: () => getPoliceDistrictByIdAndReports(id!),
    enabled: !!id,
  });
};
