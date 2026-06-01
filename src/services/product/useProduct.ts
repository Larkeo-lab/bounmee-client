import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export type ProductType = "TOOL_1" | "TOOL_2";

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
  unitId: string | null;
  unit?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  // Phone-shop fields
  fixPrice?: number | null;
  isFix?: boolean;
  fixDescription?: string | null;
  model?: string | null;
  storage?: string | null;
  buyDate?: string | null;
  sellDate?: string | null;
  color?: string | null;
  productType?: ProductType;
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
  unitId?: string | null;
  isActive?: boolean;
  isBarcode?: boolean;
  // Phone-shop fields
  fixPrice?: number | null;
  isFix?: boolean;
  fixDescription?: string | null;
  model?: string | null;
  storage?: string | null;
  buyDate?: string | null;
  sellDate?: string | null;
  color?: string | null;
  productType?: ProductType;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export const getProducts = async (
  storeId?: string,
  categoryId?: string,
  isActive?: boolean,
  search?: string,
  productType?: ProductType,
  isFix?: boolean,
): Promise<{ data: Product[] }> => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT.LIST, {
    params: { storeId, categoryId, isActive, search, productType, isFix },
  });

  return response.data;
};

export const useGetProducts = (
  storeId?: string,
  categoryId?: string,
  isActive?: boolean,
  search?: string,
  productType?: ProductType,
  isFix?: boolean,
) => {
  return useQuery({
    queryKey: [
      "products",
      storeId,
      categoryId,
      isActive,
      search,
      productType,
      isFix,
    ],
    queryFn: () =>
      getProducts(storeId, categoryId, isActive, search, productType, isFix),
    enabled: !!storeId,
  });
};

export const getProductByBarcode = async (
  barcode: string,
  storeId: string,
  userId?: string,
): Promise<Product> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.PRODUCT.BARCODE(barcode),
    {
      params: { storeId, userId },
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
      // refetchType: "all" บังคับ refetch ทุก query ["products", ...] ทันที
      // (ทั้ง active/inactive) เพราะ global ตั้ง refetchOnMount: false ไว้
      // → หน้า table / saleCafe / saleGeneral จะได้ข้อมูลใหม่ตอนเปิดหน้านั้น
      queryClient.invalidateQueries({
        queryKey: ["products"],
        refetchType: "all",
      });
    },
  });
};
