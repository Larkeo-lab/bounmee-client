import { useMutation } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

// Matches server citizenUpdateSchema (server/src/features/citizen/citizen.validate.ts)
export interface UpdateCitizenPayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO date
  gender?: "MALE" | "FEMALE" | "OTHER";
  cartNumber?: string;
  profileImage?: string | null;
  cartImage?: string;
  cartImageBack?: string | null;
}

export const updateCitizen = async (
  id: string,
  payload: UpdateCitizenPayload,
) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.CITIZEN.UPDATE(id),
    payload,
  );

  return response.data?.data;
};

export const useUpdateCitizen = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCitizenPayload }) =>
      updateCitizen(id, payload),
  });
};
