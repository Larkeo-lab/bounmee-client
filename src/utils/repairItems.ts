// รายการซ่อม (ชื่อ + ราคา) สำหรับสินค้าโทรศัพท์
// เก็บลง DB เป็น JSON string ในฟิลด์ fixDescription (ไม่ต้องแก้ backend)
// และ fixPrice = ผลรวมราคาทุกรายการ

export interface RepairItem {
  name: string;
  price: number;
}

/**
 * แตก fixDescription กลับเป็นรายการซ่อม
 * - ถ้าเป็น JSON array → ใช้ตามนั้น
 * - ถ้าเป็นข้อความธรรมดา (ข้อมูลเก่า) → fallback เป็น 1 รายการ โดยใช้ fixPrice เดิม
 */
export const parseRepairItems = (
  fixDescription?: string | null,
  fixPrice?: number | null,
): RepairItem[] => {
  if (!fixDescription) return [];
  try {
    const parsed = JSON.parse(fixDescription);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        name: String(item?.name ?? ""),
        price: Number(item?.price) || 0,
      }));
    }
  } catch {
    // ไม่ใช่ JSON → เป็นข้อความธรรมดาแบบเก่า
  }
  return [{ name: fixDescription, price: Number(fixPrice) || 0 }];
};

/** แปลงรายการซ่อมเป็น JSON string เพื่อเก็บลง fixDescription (ตัดรายการว่างทิ้ง) */
export const serializeRepairItems = (items: RepairItem[]): string | null => {
  const cleaned = items.filter(
    (item) => item.name.trim() !== "" || item.price > 0,
  );
  return cleaned.length ? JSON.stringify(cleaned) : null;
};

/** ผลรวมราคาทุกรายการซ่อม */
export const sumRepairItems = (items: RepairItem[]): number =>
  items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
