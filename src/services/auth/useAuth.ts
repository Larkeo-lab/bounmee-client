import { axiosInstance } from "@/lib";
import { AuthResponse } from "@/types";
import { API_ENDPOINTS } from "@/config/api";

export const useAuthService = async (data: {
  identifier: string;
  password: string;
}) => {
  try {
    const response: AuthResponse = await axiosInstance.post(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const useRegisterService = async (data: any) => {
  try {
    const response: any = await axiosInstance.post(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
