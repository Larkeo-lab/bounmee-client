    import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
    } from "@tanstack/react-query";
    import { axiosInstance } from "@/lib/axios";

    // Generic API response type
    export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: number;
    }

    // Generic Hook for CRUD operations
// GET (List)
export const useGET = <T = any>(
  endpoint: string,
  queryKey: string | string[],
  params?: any,
  options?: Omit<UseQueryOptions<T[], Error>, "queryKey" | "queryFn">
) => {
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useQuery<T[], Error>({
    queryKey: [...keys, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get(endpoint, { params });
      // If response contains pagination, return the full object so we can access metadata
      if (data?.pagination) return data;
      return data?.data || data; // Handle both wrapper { data: [...] } and direct array response
    },
    ...options,
  });
};

// GET One (Detail)
export const useGETOne = <T = any>(
  endpoint: string,
  queryKey: string | string[],
  id: string | number,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
) => {
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useQuery<T, Error>({
    queryKey: [...keys, id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${endpoint}/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
    ...options,
  });
};

// POST (Create)
export const usePOST = <T = any, TCreate = any>(
  endpoint: string,
  queryKey: string | string[],
  options?: Omit<UseMutationOptions<T, Error, TCreate>, "mutationFn">
) => {
  const queryClient = useQueryClient();
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useMutation<T, Error, TCreate>({
    mutationFn: async (newData) => {
      const { data } = await axiosInstance.post(endpoint, newData);
      return data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: keys });
    },
    ...options,
  });
};

// PUT (Update full resource)
export const usePUT = <T = any, TUpdate = any>(
  endpoint: string,
  queryKey: string | string[],
  options?: Omit<UseMutationOptions<T, Error, { id: string | number; data: TUpdate }>, "mutationFn">
) => {
  const queryClient = useQueryClient();
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useMutation<T, Error, { id: string | number; data: TUpdate }>({
    mutationFn: async ({ id, data: updateData }) => {
      const { data } = await axiosInstance.put(`${endpoint}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: keys });
    },
    ...options,
  });
};

// PATCH (Partial update)
export const usePATCH = <T = any, TUpdate = any>(
  endpoint: string,
  queryKey: string | string[],
  options?: Omit<UseMutationOptions<T, Error, { id: string | number; data: Partial<TUpdate> }>, "mutationFn">
) => {
  const queryClient = useQueryClient();
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useMutation<T, Error, { id: string | number; data: Partial<TUpdate> }>({
    mutationFn: async ({ id, data: updateData }) => {
      const { data } = await axiosInstance.patch(`${endpoint}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys });
    },
    ...options,
  });
};

// DELETE
export const useDELETE = (
  endpoint: string,
  queryKey: string | string[],
  options?: Omit<UseMutationOptions<void, Error, string | number>, "mutationFn">
) => {
  const queryClient = useQueryClient();
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      await axiosInstance.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys });
    },
    ...options,
  });
};
