import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Zone } from "./useZone";

export interface TableItem {
  id: string;
  name: string;
  qrCode: string | null;
  description: string | null;
  capacity: number;
  storeId: string;
  zoneId: string | null;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  zone?: Zone;
}

export interface CreateTableInput {
  name: string;
  qrCode?: string;
  description?: string;
  capacity?: number;
  storeId: string;
  zoneId?: string;
  isActive?: boolean;
  status?: string;
}

export interface UpdateTableInput extends Partial<CreateTableInput> {
  id: string;
}

export const getTables = async (storeId?: string, search?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.TABLE.LIST, {
    params: { storeId, search },
  });
  return response.data;
};

export const useGetTables = (storeId?: string, search?: string) => {
  return useQuery({
    queryKey: ["tables", storeId, search],
    queryFn: () => getTables(storeId, search),
    enabled: !!storeId,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTableInput) =>
      axiosInstance.post(API_ENDPOINTS.TABLE.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.storeId],
      });
      toast.success("ເພີ່ມໂຕະສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມໂຕະ");
    },
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTableInput) =>
      axiosInstance.put(API_ENDPOINTS.TABLE.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.storeId],
      });
      toast.success("ອັບເດດໂຕະສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດໂຕະ");
    },
  });
};

export const useDeleteTable = (storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.TABLE.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", storeId] });
      toast.success("ລຶບໂຕະສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບໂຕະ");
    },
  });
};

export const useGenerateQrCodes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) =>
      axiosInstance.post(API_ENDPOINTS.TABLE.LIST + "/generate-qrcodes", {
        storeId,
      }),
    onSuccess: (_, storeId) => {
      queryClient.invalidateQueries({
        queryKey: ["tables", storeId],
      });
      toast.success("ສ້າງ QR Code ສຳລັບໂຕ๊ะທີ່ຍັງບໍ່ມີ ສຳເລັດແລ້ວ!");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ QR Code");
    },
  });
};
