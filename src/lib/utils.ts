import clsx, { type ClassValue } from "clsx";

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