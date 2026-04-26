import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  storeId: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  storeId: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  description?: string;
  storeId?: string;
}

export const getCategories = async (storeId?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.CATEGORY.LIST, {
    params: { storeId },
  });

  return response.data;
};

export const useGetCategories = (storeId?: string) => {
  return useQuery({
    queryKey: ["categories", storeId],
    queryFn: () => getCategories(storeId),
    enabled: !!storeId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      axiosInstance.post(API_ENDPOINTS.CATEGORY.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.storeId],
      });
      toast.success("ເພີ່ມປະເພດສິນຄ້າສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມປະເພດສິນຄ້າ");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCategoryInput) =>
      axiosInstance.put(API_ENDPOINTS.CATEGORY.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.storeId],
      });
      toast.success("ອັບເດດປະເພດສິນຄ້າສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດສິນຄ້າ");
    },
  });
};

export const useDeleteCategory = (storeId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.CATEGORY.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", storeId] });
      toast.success("ລຶບປະເພດສິນຄ້າສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບປະເພດສິນຄ້າ");
    },
  });
};
