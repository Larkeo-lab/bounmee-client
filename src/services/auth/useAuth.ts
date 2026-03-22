import { axiosInstance } from "@/lib";
import { AuthResponse } from "@/types";

const SERVICES_ENDPOINT = "/api/v1/auth/login-officer";
// const SERVICES_ENDPOINT = "http://localhost:8081/api/v1/login-officer";

export const useAuthService = async (data: {
  username: string;
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
