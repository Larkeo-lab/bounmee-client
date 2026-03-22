import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface CustomTableProps {
  children: React.ReactNode;
  header: (string | JSX.Element)[];
  headerClassName?: string;
  onHeaderClick?: (headerText: string) => void;
  renderSortIcon?: (headerText: string) => React.ReactNode;
  isLoading?: boolean;
  emptyContent?: React.ReactNode;
}

// ສ່ວນລວມຂອງ Response ທີ່ມາຈາກ API
export interface AuthResponse {
  code: string;
  message: string;
  data: AuthData;
}

// ຂໍ້ມູນຫຼັກໃນສ່ວນຂອງ Data
export interface AuthData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  userName: string;
  userType: "OFFICER" | "CITIZEN"; // ສາມາດເພີ່ມ type ອື່ນໆໄດ້ຖ້າມີ
  gender: "MALE" | "FEMALE" | "OTHER";
  profileImage: string;
  userStatus: "ACTIVE" | "INACTIVE";
  lastLogin: string; // ຫຼື Date
  loginAttempts: number;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  citizenProfile: null | any; // ປ່ຽນ any ເປັນ interface ຖ້າມີຂໍ້ມູນ
  officerProfile: OfficerProfile;
  accessToken: string;
  refreshToken: string;
}

// ຂໍ້ມູນສະເພາະຂອງພະນັກງານ (Officer)
export interface OfficerProfile {
  id: string;
  roleId: string;
  userId: string;
  officerNo: string;
  position: string;
  village: string;
  districtId: string;
  provinceId: string;
  createdAt: string;
  updatedAt: string;
  organizations: Organization[];
  serviceCenterId: string;
}

// ຂໍ້ມູນກະຊວງທີ່ພະນັກງານສັງກັດ
export interface Organization {
  id: string;
  officerId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
