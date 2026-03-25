import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  users?: any[];
  createdAt: string;
  updatedAt: string;
}

export const getStoreDetail = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.STORE.DETAIL(id));
  return response.data;
};

export const updateStore = async (data: Partial<Store> & { id: string }) => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(
    API_ENDPOINTS.STORE.DETAIL(id),
    payload,
  );
  return response.data;
};

export const useGetStoreDetail = (id?: string) => {
  return useQuery({
    queryKey: ["store-detail", id],
    queryFn: () => getStoreDetail(id!),
    enabled: !!id,
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Store> & { id: string }) => updateStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-detail"] });
      toast.success("ອັບເດດຂໍ້ມູນຮ້ານສຳເລັດ");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຮ້ານ";
      toast.error(message);
    },
  });
};
