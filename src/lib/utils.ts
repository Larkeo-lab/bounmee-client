import clsx, { type ClassValue } from "clsx";
import { API_BASE_URL } from "./axios";
import { API_ENDPOINTS } from "@/config/api";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// function format date
export const formatDate = (date: string, time: boolean = false) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(time && { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  })
}

export const formatLaoDate = (date: string, time: boolean = false) => {
  return new Date(date).toLocaleDateString('lo-LA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(time && { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  })
}

export const getDisplayImageUrl = (image: string | null | undefined) => {
  if (!image) return "";
  if (
    image.startsWith("http") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }
  return `${API_BASE_URL}${API_ENDPOINTS.STORAGE.VIEW_IMAGE("original", image)}`;
};