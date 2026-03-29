const API_VERSION = "/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_VERSION}/auth/login-store`,
    LOGIN_USER: `${API_VERSION}/auth/login`,
  },
  STORAGE: {
    IMAGE: `${API_VERSION}/storage/image/upload`,
    FILE: `${API_VERSION}/storage/upload-stream`,
    DELETE_IMAGE: `${API_VERSION}/storage/image`,
    VIEW_IMAGE: (size: string, filename: string) =>
      `${API_VERSION}/storage/view-image/${size}/${filename}`,
  },
  BANK: {
    LIST: `${API_VERSION}/bank`,
    DETAIL: (id: string) => `${API_VERSION}/bank/${id}`,
  },
  CATEGORY: {
    LIST: `${API_VERSION}/category`,
    DETAIL: (id: string) => `${API_VERSION}/category/${id}`,
  },
  PRODUCT: {
    LIST: `${API_VERSION}/product`,
    BARCODE: (barcode: string) => `${API_VERSION}/product/barcode/${barcode}`,
    DETAIL: (id: string) => `${API_VERSION}/product/${id}`,
  },
  ORDER: {
    CREATE: `${API_VERSION}/order`,
    LIST: `${API_VERSION}/order`,
    DETAIL: (id: string) => `${API_VERSION}/order/${id}`,
  },
  STORE: {
    LIST: `${API_VERSION}/store`,
    DETAIL: (id: string) => `${API_VERSION}/store/${id}`,
  },
  EMPLOYEE: {
    LIST: `${API_VERSION}/employee`,
    DETAIL: (id: string) => `${API_VERSION}/employee/${id}`,
  },
  SOCKET: {
    LISTEN: `${API_VERSION}/socket`,
  },
  DASHBOARD: {
    GET: `${API_VERSION}/dashboard`,
  },
  MONEY_RATE: {
    LIST: `${API_VERSION}/money-rate`,
    DETAIL: (id: string) => `${API_VERSION}/money-rate/${id}`,
  },
};
