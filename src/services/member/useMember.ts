import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
  storeId: string | null;
  createdAt: string;
}

export interface CreateMemberInput {
  name: string;
  phone: string;
  points?: number;
  storeId?: string | null;
}

export interface UpdateMemberInput {
  id: string;
  name?: string;
  phone?: string;
  points?: number;
  storeId?: string | null;
}

export const getMembers = async (storeId?: string, search?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.MEMBER.LIST, {
    params: { storeId, search },
  });

  return response.data;
};

export const useGetMembers = (storeId?: string, search?: string) => {
  return useQuery({
    queryKey: ["members", storeId, search],
    queryFn: () => getMembers(storeId, search),
    enabled: !!storeId,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberInput) =>
      axiosInstance.post(API_ENDPOINTS.MEMBER.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["members", variables.storeId],
      });
      toast.success("ເພີ່ມສະມາຊິກສຳເລັດ");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສະມາຊິກ";
      toast.error(message);
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateMemberInput) =>
      axiosInstance.patch(API_ENDPOINTS.MEMBER.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["members", variables.storeId],
      });
      toast.success("ອັບເດດສະມາຊິກສຳເລັດ");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "ເກີດຂໍ້ຜິດພาดໃນການອັບເດດສະມາຊິກ";
      toast.error(message);
    },
  });
};

export const useDeleteMember = (storeId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.MEMBER.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", storeId] });
      toast.success("ລຶບສະມາຊິກສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບສະມາຊິກ");
    },
  });
};
