import { axiosInstance } from "@/lib";
import { AuthResponse } from "@/types";

const SERVICES_ENDPOINT = "/api/v1/auth/login-store";

export const useAuthService = async (data: {
  userName: string;
  password: string;
}) => {
  try {
    const response: AuthResponse = await axiosInstance.post(
      SERVICES_ENDPOINT,
      data,
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
