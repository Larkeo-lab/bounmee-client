import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export interface Zone {
  id: string;
  name: string;
  description: string | null;
  storeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneInput {
  name: string;
  description?: string;
  storeId: string;
  isActive?: boolean;
}

export interface UpdateZoneInput extends Partial<CreateZoneInput> {
  id: string;
}

export const getZones = async (storeId?: string, search?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.ZONE.LIST, {
    params: { storeId, search },
  });
  return response.data;
};

export const useGetZones = (storeId?: string, search?: string) => {
  return useQuery({
    queryKey: ["zones", storeId, search],
    queryFn: () => getZones(storeId, search),
    enabled: !!storeId,
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateZoneInput) =>
      axiosInstance.post(API_ENDPOINTS.ZONE.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["zones", variables.storeId],
      });
      toast.success("ເພີ່ມໂຊນສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມໂຊນ");
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateZoneInput) =>
      axiosInstance.put(API_ENDPOINTS.ZONE.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["zones", variables.storeId],
      });
      toast.success("ອັບເດດໂຊນສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດໂຊນ");
    },
  });
};

export const useDeleteZone = (storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.ZONE.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones", storeId] });
      toast.success("ລຶບໂຊນສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບໂຊນ");
    },
  });
};
