import { useMutation, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export type ReportStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "REJECTED"
  | "APPROVED"
  | "CANCELLED";

export type AssigneeType =
  | "VILLAGE_CHIEF"
  | "DISTRICT_POLICE"
  | "POLICE_DEPARTMENT"
  | "CITIZEN";

export interface ReportHistoryItem {
  id: string;
  fromAssignee?: AssigneeType | null;
  toAssignee: AssigneeType;
  byUserId?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface ReportMoreDetailItem {
  id: string;
  detail: string;
  images?: string[];
  attachments?: string | null;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  image?: string | null;
  video?: string | null;
  attachments?: string[] | null;
  status: ReportStatus;
  currentAssignee?: AssigneeType;
  createdAt: string;
  updatedAt: string;
  province?: { nameLo?: string } | null;
  district?: { nameLo?: string } | null;
  village?: { nameLo?: string } | null;
  user?: {
    id: string;
    userName?: string | null;
    email?: string | null;
    phone?: string | null;
    userType?: string;
  } | null;
  history?: ReportHistoryItem[];
  reportMoreDetail?: ReportMoreDetailItem[];
}

export interface ReportFilters {
  userId?: string;
  provinceId?: string;
  districtId?: string;
  villageId?: string;
  status?: ReportStatus;
  currentAssignee?: AssigneeType;
  reachedAssignee?: AssigneeType;
  search?: string;
  page?: number;
  limit?: number;
}

// Matches server reportCreateSchema (server/src/features/report/report.validate.ts)
export interface CreateReportPayload {
  title: string;
  description?: string | null;
  provinceId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  location: string;
  image?: string | null;
  video?: string | null;
  attachments?: string[] | null;
}

export const createReport = async (payload: CreateReportPayload) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.REPORT.CREATE,
    payload,
  );

  return response.data?.data;
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: createReport,
  });
};

export const getReports = async (
  filters: ReportFilters = {},
): Promise<ReportItem[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.REPORT.LIST, {
    params: {
      page: filters.page || 1,
      limit: filters.limit || 50,
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.provinceId ? { provinceId: filters.provinceId } : {}),
      ...(filters.districtId ? { districtId: filters.districtId } : {}),
      ...(filters.villageId ? { villageId: filters.villageId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.currentAssignee ? { currentAssignee: filters.currentAssignee } : {}),
      ...(filters.reachedAssignee ? { reachedAssignee: filters.reachedAssignee } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    },
  });

  return response.data?.data || [];
};

export const forwardReport = async (id: string) => {
  const response = await axiosInstance.put(API_ENDPOINTS.REPORT.FORWARD(id));

  return response.data?.data;
};

export const useForwardReport = () => {
  return useMutation({ mutationFn: forwardReport });
};

export interface AddReportMoreDetailPayload {
  detail: string;
  images?: string[];
  attachments?: string | null;
}

export const addReportMoreDetail = async (
  id: string,
  payload: AddReportMoreDetailPayload,
) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.REPORT.MORE_DETAIL(id),
    payload,
  );

  return response.data?.data;
};

export const useAddReportMoreDetail = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddReportMoreDetailPayload }) =>
      addReportMoreDetail(id, payload),
  });
};

export const receiveReport = async (id: string) => {
  const response = await axiosInstance.put(API_ENDPOINTS.REPORT.RECEIVE(id));

  return response.data?.data;
};

export const useReceiveReport = () => {
  return useMutation({ mutationFn: receiveReport });
};

export const resolveReport = async (id: string) => {
  const response = await axiosInstance.put(API_ENDPOINTS.REPORT.RESOLVE(id));

  return response.data?.data;
};

export const useResolveReport = () => {
  return useMutation({ mutationFn: resolveReport });
};

export interface UpdateReportPayload {
  title?: string;
  description?: string | null;
  location?: string;
  image?: string | null;
  video?: string | null;
  attachments?: string[] | null;
}

export const updateReport = async (id: string, payload: UpdateReportPayload) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.REPORT.UPDATE(id),
    payload,
  );

  return response.data?.data;
};

export const useUpdateReport = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportPayload }) =>
      updateReport(id, payload),
  });
};

export const getReportById = async (id: string): Promise<ReportItem> => {
  const response = await axiosInstance.get(API_ENDPOINTS.REPORT.DETAIL(id));

  return response.data?.data;
};

export const useGetReport = (id?: string) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(id!),
    enabled: !!id,
  });
};

export interface VillageReportsResult {
  village: {
    id: string;
    code: string;
    nameLo: string;
    nameEn?: string;
    districtCode?: string | null;
    image?: string | null;
    chiefName?: string;
    deputyChiefName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  reports: ReportItem[];
  total: number;
}

// All reports for one village (+ village info), via the dedicated endpoint
export const getVillageReports = async (
  villageId: string,
): Promise<VillageReportsResult | null> => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.REPORT.BY_VILLAGE(villageId),
  );

  return response.data?.data || null;
};

export const useGetVillageReports = (villageId?: string) => {
  return useQuery({
    queryKey: ["village-reports", villageId],
    queryFn: () => getVillageReports(villageId!),
    enabled: !!villageId,
  });
};

export const useGetReports = (filters: ReportFilters = {}) => {
  // If a userId key was supplied (user-scoped list), wait until it's truthy so
  // we never fall back to fetching everyone's reports while auth is loading.
  const enabled = "userId" in filters ? !!filters.userId : true;

  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => getReports(filters),
    enabled,
  });
};
