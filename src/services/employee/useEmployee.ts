import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export interface User {
  id: string;
  userName: string;
  phone: string;
  role: "STORE_ADMIN" | "EMPLOYEE";
}

export interface Employee {
  id: string;
  name: string;
  logoUrl: string | null;
  storeId: string;
  users: User[];
  permission?: { id: string; name: string } | null;
  businessType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  name: string;
  logoUrl?: string;
  isActive?: boolean;
  storeId: string;
  phone: string;
  userName: string;
  password?: string;
  role?: "EMPLOYEE";
  language?: "LA" | "EN";
  permissionId?: string;
  businessType?: string;
}

export interface UpdateEmployeeInput {
  id: string;
  name?: string;
  logoUrl?: string;
  isActive?: boolean;
  storeId?: string;
  phone?: string;
  userName?: string;
  password?: string;
  language?: "LA" | "EN";
  permissionId?: string;
  businessType?: string;
}

export const getEmployees = async (storeId?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.EMPLOYEE.LIST, {
    params: { storeId },
  });
  return response.data;
};

export const useGetEmployees = (storeId?: string) => {
  return useQuery({
    queryKey: ["employees", storeId],
    queryFn: () => getEmployees(storeId),
    enabled: !!storeId,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) =>
      axiosInstance.post(API_ENDPOINTS.EMPLOYEE.LIST, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.storeId],
      });
      toast.success("ເພີ່ມຂໍ້ມູນພະນັກງານສຳເລັດ");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນພະນັກງານ";
      toast.error(message);
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateEmployeeInput) =>
      axiosInstance.put(API_ENDPOINTS.EMPLOYEE.DETAIL(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.storeId],
      });
      toast.success("ອັບເດດຂໍ້ມູນພະນັກງານສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນພະນັກງານ");
    },
  });
};

export const useDeleteEmployee = (storeId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(API_ENDPOINTS.EMPLOYEE.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
      toast.success("ລຶບຂໍ້ມູນພະນັກງານສຳເລັດ");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນພະນັກງານ");
    },
  });
};
