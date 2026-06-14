import { useMutation, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export type NewsStatus = "PENDING" | "ACTIVE" | "INACTIVE";

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  status: NewsStatus;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsFilters {
  createdBy?: string;
  status?: NewsStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Matches server newsCreateSchema (server/src/features/news/news.validate.ts)
export interface CreateNewsPayload {
  title: string;
  content: string;
  image: string;
  status?: NewsStatus;
}

export interface UpdateNewsPayload {
  title?: string;
  content?: string;
  image?: string;
  status?: NewsStatus;
  isActive?: boolean;
}

export const getNews = async (
  filters: NewsFilters = {},
): Promise<NewsItem[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.NEWS.LIST, {
    params: {
      page: filters.page || 1,
      limit: filters.limit || 50,
      ...(filters.createdBy ? { createdBy: filters.createdBy } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    },
  });

  return response.data?.data || [];
};

export const useGetNews = (filters: NewsFilters = {}) => {
  // When a createdBy key is supplied (the "my news" tab), wait until it's
  // truthy so we never fetch everyone's news while auth is still loading.
  const enabled = "createdBy" in filters ? !!filters.createdBy : true;

  return useQuery({
    queryKey: ["news", filters],
    queryFn: () => getNews(filters),
    enabled,
  });
};

export const getNewsById = async (id: string): Promise<NewsItem> => {
  const response = await axiosInstance.get(API_ENDPOINTS.NEWS.DETAIL(id));

  return response.data?.data;
};

export const useGetNewsById = (id?: string) => {
  return useQuery({
    queryKey: ["news", "detail", id],
    queryFn: () => getNewsById(id!),
    enabled: !!id,
  });
};

export const createNews = async (payload: CreateNewsPayload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.NEWS.CREATE, payload);

  return response.data?.data;
};

export const useCreateNews = () => {
  return useMutation({
    mutationFn: createNews,
  });
};

export const updateNews = async (id: string, payload: UpdateNewsPayload) => {
  const response = await axiosInstance.put(API_ENDPOINTS.NEWS.DETAIL(id), payload);

  return response.data?.data;
};

export const useUpdateNews = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNewsPayload }) =>
      updateNews(id, payload),
  });
};

export const deleteNews = async (id: string) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.NEWS.DETAIL(id));

  return response.data?.data;
};

export const useDeleteNews = () => {
  return useMutation({ mutationFn: deleteNews });
};
