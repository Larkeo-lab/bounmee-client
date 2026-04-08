import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface OrderItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
  subTotal: number;
  status?: string;
  note?: string;
}

export interface CreateOrderInput {
  totalAmount: number;
  receivedAmount: number;
  change: number;
  paymentMethod: "CASH" | "TRANSFER";
  storeId: string;
  employeeId: string | null;
  bankId?: string | null;
  tableId?: string | null;
  businessType?: "RETAIL" | "CAFE";
  items: OrderItemInput[];
}

export interface OrderItem {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
  subTotal: number;
  product: {
    id: string;
    name: string;
    barcode: string;
    price: number;
    image: string | null;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  receivedAmount: number;
  change: number;
  paymentMethod: "CASH" | "TRANSFER";
  storeId: string;
  employee?: {
    name: string;
  };
  bank?: {
    name: string;
    logoUrl?: string;
  };
  table?: {
    name: string;
  };
  businessType?: "RETAIL" | "CAFE";
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalAmount: number;
    totalCash: number;
    totalTransfer: number;
    transfersByBank: {
      name: string;
      logoUrl?: string;
      total: number;
    }[];
  };
}

export interface OrderFilters {
  storeId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  employeeId?: string;
}

export const createOrder = async (data: CreateOrderInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.ORDER.CREATE, data);
  return response.data;
};

export const getOrders = async (filters: OrderFilters) => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDER.LIST, {
    params: filters,
  });
  return response.data;
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Also might want to invalidate products if stock changes
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useGetOrders = (filters: OrderFilters) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
    enabled: !!filters.storeId,
  });
};
