import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/routes/AuthContext";

// ============ Permission Management ============
export interface GetPermissionsParams {
  storeId?: string;
  isActive?: boolean;
  search?: string;
}

export const getPermissions = async (params?: GetPermissionsParams) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PERMISSION.LIST, {
    params,
  });

  return response.data;
};

export const getPermissionById = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PERMISSION.DETAIL(id));

  return response.data;
};

export const createPermission = async (data: any) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.PERMISSION.LIST,
    data,
  );

  return response.data;
};

export const updatePermission = async (id: string, data: any) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.PERMISSION.DETAIL(id),
    data,
  );

  return response.data;
};

export const deletePermission = async (id: string) => {
  const response = await axiosInstance.delete(
    API_ENDPOINTS.PERMISSION.DETAIL(id),
  );

  return response.data;
};

// ============ React Query Hooks for Permissions ============
export const useGetPermissions = (params?: GetPermissionsParams) => {
  const { user } = useAuth();
  const storeId = user?.user?.store?.id || "";

  return useQuery({
    queryKey: ["permissions", storeId, params],
    queryFn: () =>
      getPermissions({
        storeId,
        ...params,
      }),
    enabled: !!storeId,
  });
};

export const useGetPermissionById = (id: string) => {
  return useQuery({
    queryKey: ["permission", id],
    queryFn: () => getPermissionById(id),
    enabled: !!id,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create permission",
      );
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update permission",
      );
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete permission",
      );
    },
  });
};
