import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { Product } from "@/services/product/useProduct";

export interface ProductUpdateHistory {
  id: string;
  oldStockQty: number | null;
  newStockQty: number | null;
  oldCost: number;
  newCost: number;
  oldPrice: number;
  newPrice: number;
  productId: string;
  updatedBy: string | null;
  updatedAt: string;
  product?: Product;
}

export interface ProductUpdateHistoryParams {
  page: number;
  limit: number;
  search?: string;
  storeId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}

export const getProductUpdateHistories = async (
  params: ProductUpdateHistoryParams,
) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.PRODUCT_UPDATE_HISTORY.LIST,
    { params },
  );
  return response.data;
};

export const useGetProductUpdateHistories = (
  params: ProductUpdateHistoryParams,
) => {
  return useQuery({
    queryKey: ["product-update-histories", params],
    queryFn: () => getProductUpdateHistories(params),
    enabled: !!params.storeId || !!params.productId,
  });
};

export interface CreateProductUpdateHistoryInput {
  oldStockQty?: number | null;
  newStockQty?: number | null;
  oldCost: number;
  newCost: number;
  oldPrice: number;
  newPrice: number;
  productId: string;
}

export const createProductUpdateHistory = async (
  data: CreateProductUpdateHistoryInput,
) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.PRODUCT_UPDATE_HISTORY.LIST,
    data,
  );
  return response.data;
};

export const useCreateProductUpdateHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductUpdateHistoryInput) =>
      createProductUpdateHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-update-histories"] });
    },
  });
};
