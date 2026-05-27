import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface OrderItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
  subTotal: number;
  status?: string;
  note?: string;
  unitName?: string;
}

export interface CreateOrderInput {
  totalAmount: number;
  receivedAmount: number;
  change: number;
  paymentMethod: "CASH" | "TRANSFER" | "TRANSFER_CASH";
  storeId: string;
  employeeId?: string | null;
  bankId?: string | null;
  items: OrderItemInput[];
  tableId?: string | null;
  zoneId?: string | null;
  businessType?: "RETAIL" | "CAFE";
  discountAmount?: number;
  isDiscount?: boolean;
  discountPercent?: number;
  isDebt?: boolean;
  debtAmount?: number;
  transferAmount?: number;
  cashAmount?: number;
  creditCardAmount?: number;
  memberId?: string | null;
  dueDate?: string | null;
  paymentStatus?: "PAID" | "UNPAID" | "PARTIALLY_PAID";
}

export interface OrderItem {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
  subTotal: number;
  unitName?: string | null;
  product: {
    id: string;
    name: string;
    barcode: string;
    price: number;
    image: string | null;
    unit?: {
      id: string;
      name: string;
    };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  receivedAmount: number;
  change: number;
  paymentMethod: "CASH" | "TRANSFER" | "TRANSFER_CASH";
  storeId: string;
  employee?: {
    name: string;
  };
  bank?: {
    name: string;
    logoUrl?: string;
  };
  tableId?: string | null;
  table?: {
    id?: string;
    name: string;
  };
  businessType?: "RETAIL" | "CAFE";
  items: OrderItem[];
  discountAmount?: number;
  isDiscount?: boolean;
  discountPercent?: number;
  isDebt?: boolean;
  debtAmount?: number;
  transferAmount?: number;
  cashAmount?: number;
  creditCardAmount?: number;
  memberId?: string | null;
  member?: {
    id: string;
    name: string;
    phone: string;
  };
  dueDate?: string | null;
  paymentStatus: "PAID" | "UNPAID" | "PARTIALLY_PAID";
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
    totalDiscount: number;
    totalCash: number;
    totalTransfer: number;
    totalDebt: number;
    totalCreditCard: number;
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
  isDiscount?: boolean;
  isDebt?: boolean;
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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

export const useGetOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.ORDER.DETAIL(id));
      return response.data;
    },
    enabled: !!id,
  });
};

export interface UpdateOrderItemsInput {
  items: OrderItemInput[];
  totalAmount: number;
  discountAmount?: number;
  isDiscount?: boolean;
  discountPercent?: number;
  receivedAmount?: number;
  change?: number;
  paymentMethod?: "CASH" | "TRANSFER" | "TRANSFER_CASH";
  cashAmount?: number | null;
  transferAmount?: number | null;
  bankId?: string | null;
  paymentStatus?: "PAID" | "UNPAID" | "PARTIALLY_PAID";
  isDebt?: boolean;
  debtAmount?: number;
  memberId?: string | null;
  dueDate?: string | null;
}

export const useUpdateOrderItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderItemsInput }) =>
      axiosInstance.patch(API_ENDPOINTS.ORDER.UPDATE_ITEMS(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      paymentStatus,
      receivedAmount,
      note,
      bankId,
      paymentMethod,
    }: {
      id: string;
      paymentStatus: string;
      receivedAmount?: number;
      note?: string;
      bankId?: string | null;
      paymentMethod?: string;
    }) =>
      axiosInstance.patch(`${API_ENDPOINTS.ORDER.LIST}/status/${id}`, {
        paymentStatus,
        receivedAmount,
        note,
        bankId,
        paymentMethod,
      }),
    onSuccess: () => {
      console.log("Order status updated, refetching debt queries...");
      queryClient.refetchQueries({
        queryKey: ["members-debt"],
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: ["member-debt-details"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"], exact: false });
    },
  });
};
