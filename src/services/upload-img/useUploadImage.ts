import { axiosInstance } from "@/lib";

export const UPLOAD_URL_PATH = "/api/v1/storage/file/upload";
export const DELETE_URL_PATH = "/api/v1/storage/file";

export const useUploadImage = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post(UPLOAD_URL_PATH, formData, {
            headers: {
                "Content-Type": undefined as any,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const useDeleteImage = async (fileName: string) => {
    try {
        const response = await axiosInstance.delete(`${DELETE_URL_PATH}/${fileName}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};