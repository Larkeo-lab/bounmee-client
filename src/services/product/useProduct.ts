import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string | null;
  cost: number;
  price: number;
  stockQty: number;
  image: string | null;
  categoryId: string;
  storeId: string;
  isActive: boolean;
  isBarcode: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface CreateProductInput {
  barcode: string;
  name: string;
  description?: string;
  cost: number;
  price: number;
  stockQty: number;
  categoryId: string;
  storeId: string;
  image?: string;
  isActive?: boolean;
  isBarcode?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export const getProducts = async (
  storeId?: string,
  categoryId?: string,
  isActive?: boolean,
  search?: string,
): Promise<{ data: Product[] }> => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT.LIST, {
    params: { storeId, categoryId, isActive, search },
  });

  return response.data;
};

export const useGetProducts = (
  storeId?: string,
  categoryId?: string,
  isActive?: boolean,
  search?: string,
) => {
  return useQuery({
    queryKey: ["products", storeId, categoryId, isActive, search],
    queryFn: () => getProducts(storeId, categoryId, isActive, search),
    enabled: !!storeId,
  });
};

export const getProductByBarcode = async (
  barcode: string,
  storeId: string,
): Promise<Product> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.PRODUCT.BARCODE(barcode),
    {
      params: { storeId },
    },
  );

  return response.data.data;
};

export const createProduct = async (data: CreateProductInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PRODUCT.LIST, data);

  return response.data;
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const updateProduct = async (data: UpdateProductInput) => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(
    API_ENDPOINTS.PRODUCT.DETAIL(id),
    payload,
  );

  return response.data;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductInput) => updateProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const deleteProduct = async (id: string) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCT.DETAIL(id));

  return response.data;
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
