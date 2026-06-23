import { useMutation, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface VillageChiefUser {
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

export interface VillageChiefItem {
  id: string;
  chiefName: string;
  deputyChiefName: string;
  image?: string | null;
  bgImage?: string | null;
  createdAt: string;
  updatedAt: string;
  users?: VillageChiefUser[];
}

// Matches server villageChiefCreateSchema
export interface CreateVillageChiefPayload {
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

export interface UpdateVillageChiefPayload {
  chiefName?: string;
  deputyChiefName?: string;
  image?: string | null;
  bgImage?: string | null;
  userName?: string;
  password?: string;
  email?: string | null;
  phone?: string | null;
  provinceId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  address?: string | null;
}

export const getVillageChiefs = async (): Promise<VillageChiefItem[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.VILLAGE_CHIEF.LIST, {
    params: { limit: 100 },
  });

  return response.data?.data || [];
};

export const useGetVillageChiefs = () => {
  return useQuery({
    queryKey: ["village-chiefs"],
    queryFn: getVillageChiefs,
  });
};

export const createVillageChief = async (
  payload: CreateVillageChiefPayload,
) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.VILLAGE_CHIEF.CREATE,
    payload,
  );

  return response.data?.data;
};

export const useCreateVillageChief = () => {
  return useMutation({ mutationFn: createVillageChief });
};

export const updateVillageChief = async (
  id: string,
  payload: UpdateVillageChiefPayload,
) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.VILLAGE_CHIEF.UPDATE(id),
    payload,
  );

  return response.data?.data;
};

export const useUpdateVillageChief = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVillageChiefPayload }) =>
      updateVillageChief(id, payload),
  });
};

// Detail (for prefilling the profile form)
export const getVillageChief = async (
  id: string,
): Promise<VillageChiefItem | null> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.VILLAGE_CHIEF.DETAIL(id),
  );
  return response.data?.data || null;
};

export const useGetVillageChief = (id?: string) => {
  return useQuery({
    queryKey: ["village-chief", id],
    queryFn: () => getVillageChief(id!),
    enabled: !!id,
  });
};

// Self-profile update (VILLAGE_CHIEF updates their own record)
export const updateMyVillageChief = async (
  payload: UpdateVillageChiefPayload,
) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.VILLAGE_CHIEF.UPDATE_ME,
    payload,
  );
  return response.data?.data;
};

export const useUpdateMyVillageChief = () => {
  return useMutation({ mutationFn: updateMyVillageChief });
};

export const deleteVillageChief = async (id: string) => {
  const response = await axiosInstance.delete(
    API_ENDPOINTS.VILLAGE_CHIEF.DELETE(id),
  );

  return response.data?.data;
};

export const useDeleteVillageChief = () => {
  return useMutation({ mutationFn: deleteVillageChief });
};
