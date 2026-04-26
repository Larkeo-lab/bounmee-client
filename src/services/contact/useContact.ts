import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface Contact {
  id: string;
  profileImage: string;
  name: string;
  phoneNumber: string;
  email: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getContacts = async (): Promise<Contact[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.CONTACT.LIST);

  // Based on ResponsePaginationSuccess in the backend
  return response.data.data;
};

export const useGetContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
  });
};
