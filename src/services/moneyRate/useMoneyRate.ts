import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface MoneyRate {
  id: string;
  name: string;
  rateSell: number;
  rateBuy: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoneyRateInput {
  name: string;
  rateSell: number;
  rateBuy: number;
  storeId: string;
}

export interface UpdateMoneyRateInput {
  id: string;
  name?: string;
  rateSell?: number;
  rateBuy?: number;
  storeId?: string;
}

export const getMoneyRates = async (storeId?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.MONEY_RATE.LIST, {
    params: { storeId },
  });

  return response.data;
};

export const useGetMoneyRates = (storeId?: string) => {
  return useQuery({
    queryKey: ["moneyRates", storeId],
    queryFn: () => getMoneyRates(storeId),
    enabled: !!storeId,
  });
};

export const useCreateMoneyRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMoneyRateInput) =>
      axiosInstance.post(API_ENDPOINTS.MONEY_RATE.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["moneyRates", variables.storeId],
      });
      toast.success("ເພີ່ມข้อมูลอัตราแลกเปลี่ยนสำเร็จ");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "เกิดข้อผิดพลาดในการเพิ่มข้อมูลอัตราแลกเปลี่ยน";

      toast.error(message);
    },
  });
};

export const useUpdateMoneyRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateMoneyRateInput) =>
      axiosInstance.put(API_ENDPOINTS.MONEY_RATE.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["moneyRates", variables.storeId],
      });
      toast.success("อัปเดตข้อมูลอัตราแลกเปลี่ยนสำเร็จ");
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลอัตราแลกเปลี่ยน");
    },
  });
};

export const useDeleteMoneyRate = (storeId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.MONEY_RATE.DETAIL(id), {
        params: { storeId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moneyRates", storeId] });
      toast.success("ลบข้อมูลอัตราแลกเปลี่ยนสำเร็จ");
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูลอัตราแลกเปลี่ยน");
    },
  });
};
