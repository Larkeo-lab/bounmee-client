// ── Police Department portal sidebar ──────────────────────────────
// `icon` is a semantic key mapped to a lucide icon inside the component,
// so this config stays pure data (no JSX).
export type PoliceSection =
  | "dashboard"
  | "reports"
  | "police-district"
  | "village-chief"
  | "citizens"
  | "news"
  | "organization"
  | "settings";

export interface PoliceSidebarItem {
  key: PoliceSection;
  label: string;
  icon: string;
  // If set, only these user types see the item (undefined = all police roles)
  allowedUserTypes?: string[];
}

export const policeSidebarItems: PoliceSidebarItem[] = [
  { key: "dashboard", label: "ໜ້າຫຼັກ", icon: "dashboard" },
  { key: "reports", label: "ການແຈ້ງຄວາມ", icon: "reports" },
  {
    key: "police-district",
    label: "ປກສ ເມືອງ",
    icon: "police-district",
    allowedUserTypes: ["POLICE_DEPARTMENT"],
  },
  {
    key: "village-chief",
    label: "ນາຍບ້ານ",
    icon: "village-chief",
    allowedUserTypes: ["POLICE_DEPARTMENT", "DISTRICT_POLICE"],
  },
  { key: "citizens", label: "ປະຊາຊົນ", icon: "citizens" },
  { key: "news", label: "ຂ່າວສານ", icon: "news" },
  { key: "settings", label: "ຕັ້ງຄ່າ", icon: "settings" },
];
