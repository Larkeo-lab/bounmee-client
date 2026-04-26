import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

// Setting Content-Type to undefined lets axios detect FormData and auto-set
// the correct multipart/form-data boundary. Never set it manually.
const multipartConfig = { headers: { "Content-Type": undefined as any } };

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("file_name", uuidv4());

  const response = await axiosInstance.post(
    API_ENDPOINTS.STORAGE.IMAGE,
    formData,
    multipartConfig,
  );

  return response.data?.data?.imageName;
};

export const uploadImageGetUrls = async (
  file: File,
): Promise<{
  imageName: string;
  originalUrl: string;
  mediumUrl: string;
  smallUrl: string;
}> => {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("file_name", uuidv4());

  const response = await axiosInstance.post(
    API_ENDPOINTS.STORAGE.IMAGE,
    formData,
    multipartConfig,
  );

  return response.data?.data;
};

export const deleteImage = async (fileName: string): Promise<void> => {
  await axiosInstance.delete(
    `${API_ENDPOINTS.STORAGE.DELETE_IMAGE}/${fileName}`,
  );
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImage,
  });
};
