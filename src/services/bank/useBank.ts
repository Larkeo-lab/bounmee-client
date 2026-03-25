import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export interface Bank {
  id: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  storeId: string;
}

export interface CreateBankInput {
  name: string;
  logoUrl?: string;
  isActive?: boolean;
  storeId: string;
}

export interface UpdateBankInput {
  id: string;
  name?: string;
  logoUrl?: string;
  isActive?: boolean;
  storeId?: string;
}

export const getBanks = async (storeId?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BANK.LIST, {
    params: { storeId },
  });
  return response.data;
};

export const useGetBanks = (storeId?: string) => {
  return useQuery({
    queryKey: ["banks", storeId],
    queryFn: () => getBanks(storeId),
    enabled: !!storeId,
  });
};

export const useCreateBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBankInput) =>
      axiosInstance.post(API_ENDPOINTS.BANK.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["banks", variables.storeId],
      });
      toast.success("ເພີ່ມຂໍ້ມູນທະນາຄານສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນທະນາຄານ");
    },
  });
};

export const useUpdateBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateBankInput) =>
      axiosInstance.put(API_ENDPOINTS.BANK.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["banks", variables.storeId],
      });
      toast.success("ອັບເດດຂໍ້ມູນທະນາຄານສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນທະນາຄານ");
    },
  });
};

export const useDeleteBank = (storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.BANK.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks", storeId] });
      toast.success("ລຶບຂໍ້ມູນທະນາຄານສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນທະນາຄານ");
    },
  });
};
