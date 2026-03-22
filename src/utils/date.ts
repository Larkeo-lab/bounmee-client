import dayjs from "dayjs";

export function formatLaoDate(date?: string | Date | null, time: boolean = false) {
  if (!date) return "";
  const d = dayjs(date);
  if (!d.isValid()) return String(date);
  
  return d.format(time ? "DD-MM-YYYY HH:mm:ss" : "DD-MM-YYYY");
}
