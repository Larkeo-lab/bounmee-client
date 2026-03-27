import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { useQuery } from "@tanstack/react-query";

export interface DashboardSummary {
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalEmployee: number;
  totalMenu: number;
}

export interface RevenueTrend {
  label: string;
  totalSales: number;
  totalExpenses: number;
}

export interface PaymentChannel {
  method: string;
  totalSales: number;
  count: number;
  logoUrl?: string | null;
}

export interface TopSellingProduct {
  name: string;
  description?: string;
  image?: string;
  qty: number;
  totalSales: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  revenueTrend: RevenueTrend[];
  paymentChannel: PaymentChannel[];
  topSellingProducts: TopSellingProduct[];
}

export interface DashboardFilters {
  storeId?: string;
  startDate?: string;
  endDate?: string;
}

export const getDashboardData = async (filters: DashboardFilters) => {
  const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.GET, {
    params: filters,
  });
  return response.data.data as DashboardData;
};

export const useDashboard = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => getDashboardData(filters),
    enabled: !!filters.storeId,
  });
};
