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

// API Response structure
export interface AuthResponse {
  code: string;
  message: string;
  data: AuthData;
}

// Data returned after successful login
export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type Role = "SUPER_ADMIN" | "STORE_ADMIN" | "EMPLOYEE";
export type Language = "LA" | "EN";

// User model matching Prisma schema
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  userName: string | null;
  storeId: string | null;
  employeeId: string | null;
  language: Language | null;
  createdAt: string;
  updatedAt: string;
  store?: Store | null;
  employee?: Employee | null;
}

// Store model matching Prisma schema
export interface Store {
  id: string;
  name: string;
  address: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Employee model matching Prisma schema
export interface Employee {
  id: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}
