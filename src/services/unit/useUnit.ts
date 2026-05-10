import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface Unit {
  id: string;
  name: string;
  storeId: string;
  productId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitInput {
  name: string;
  storeId: string;
  productId?: string | null;
  isActive?: boolean;
}

export interface UpdateUnitInput {
  id: string;
  name?: string;
  isActive?: boolean;
  storeId: string; // for invalidating queries
}

export const getUnits = async (storeId?: string, productId?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.UNIT.LIST, {
    params: { storeId, productId },
  });

  return response.data;
};

export const useGetUnits = (storeId?: string, productId?: string) => {
  return useQuery({
    queryKey: ["units", storeId, productId],
    queryFn: () => getUnits(storeId, productId),
    enabled: !!storeId,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnitInput) =>
      axiosInstance.post(API_ENDPOINTS.UNIT.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["units", variables.storeId],
      });
      toast.success("ເພີ່ມໜ່ວຍສິນຄ້າສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມໜ່ວຍສິນຄ້າ");
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUnitInput) =>
      axiosInstance.put(API_ENDPOINTS.UNIT.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["units", variables.storeId],
      });
      toast.success("ອັບເດດໜ່ວຍສິນຄ້າສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດໜ່ວຍສິນຄ້າ");
    },
  });
};

export const useDeleteUnit = (storeId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.UNIT.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units", storeId] });
      toast.success("ລຶບໜ່ວຍສິນຄ້າສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີดຂໍ້ຜິດພາດໃນການລຶບໜ່ວຍສິນຄ້າ");
    },
  });
};
