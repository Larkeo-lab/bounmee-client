const API_VERSION = "/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_VERSION}/auth/login`,
    LOGIN_USER: `${API_VERSION}/auth/login`,
    REGISTER: `${API_VERSION}/auth/register-store`,
    REGISTER_CITIZEN: `${API_VERSION}/auth/register-citizen`,
    FIREBASE_SYNC: `${API_VERSION}/auth/firebase-sync`,
    REFRESH_TOKEN: `${API_VERSION}/auth/refresh-token`,
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
    UPDATE_ITEMS: (id: string) => `${API_VERSION}/order/items/${id}`,
  },
  UNIT: {
    LIST: `${API_VERSION}/unit`,
    DETAIL: (id: string) => `${API_VERSION}/unit/${id}`,
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
  PERMISSION: {
    LIST: `${API_VERSION}/permission`,
    DETAIL: (id: string) => `${API_VERSION}/permission/${id}`,
  },
  ROLE_PERMISSION: {
    LIST: `${API_VERSION}/permission-role`,
    DETAIL: (id: string) => `${API_VERSION}/permission-role/${id}`,
    TOGGLE_STATUS: (id: string) =>
      `${API_VERSION}/permission-role/status/${id}`,
  },
  TABLE: {
    LIST: `${API_VERSION}/table`,
    DETAIL: (id: string) => `${API_VERSION}/table/${id}`,
  },
  ZONE: {
    LIST: `${API_VERSION}/table/zones`,
    DETAIL: (id: string) => `${API_VERSION}/table/zones/${id}`,
  },
  PROVINCE: {
    LIST: `${API_VERSION}/province`,
    DETAIL: (id: string) => `${API_VERSION}/province/${id}`,
  },
  DISTRICT: {
    LIST: `${API_VERSION}/district`,
    DETAIL: (id: string) => `${API_VERSION}/district/${id}`,
    BY_PROVINCE: (provinceCode: string) =>
      `${API_VERSION}/district?provinceCode=${provinceCode}`,
  },
  VILLAGE: {
    LIST: `${API_VERSION}/village`,
    DETAIL: (id: string) => `${API_VERSION}/village/${id}`,
    BY_DISTRICT: (districtCode: string) =>
      `${API_VERSION}/village?districtCode=${districtCode}`,
  },
  CHAT: {
    HISTORY: (tableId: string) => `${API_VERSION}/chat/history/${tableId}`,
    UNREAD: (storeId: string) => `${API_VERSION}/chat/unread/${storeId}`,
    READ: (tableId: string) => `${API_VERSION}/chat/read/${tableId}`,
  },
  CONTACT: {
    LIST: `${API_VERSION}/contact`,
  },
  QUESTIONNAIRE: {
    LIST: `${API_VERSION}/questionnaire`,
    DETAIL: (id: string) => `${API_VERSION}/questionnaire/${id}`,
    SUBMIT: `${API_VERSION}/questionnaire/submit`,
  },
  MEMBER: {
    LIST: `${API_VERSION}/member`,
    DETAIL: (id: string) => `${API_VERSION}/member/${id}`,
    DEBT: `${API_VERSION}/member/debt`,
  },
  PRODUCT_UPDATE_HISTORY: {
    LIST: `${API_VERSION}/product-update-history`,
    DETAIL: (id: string) => `${API_VERSION}/product-update-history/${id}`,
  },
  REPORT: {
    CREATE: `${API_VERSION}/report`,
    LIST: `${API_VERSION}/report`,
    DETAIL: (id: string) => `${API_VERSION}/report/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/report/${id}`,
    FORWARD: (id: string) => `${API_VERSION}/report/${id}/forward`,
  },
  CITIZEN: {
    LIST: `${API_VERSION}/citizen`,
    DETAIL: (id: string) => `${API_VERSION}/citizen/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/citizen/${id}`,
  },
  NEWS: {
    CREATE: `${API_VERSION}/news`,
    LIST: `${API_VERSION}/news`,
    DETAIL: (id: string) => `${API_VERSION}/news/${id}`,
  },
  POLICE_DISTRICT: {
    CREATE: `${API_VERSION}/police-district`,
    LIST: `${API_VERSION}/police-district`,
    DETAIL: (id: string) => `${API_VERSION}/police-district/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/police-district/${id}`,
    DELETE: (id: string) => `${API_VERSION}/police-district/${id}`,
  },
  VILLAGE_CHIEF: {
    CREATE: `${API_VERSION}/village-chief`,
    LIST: `${API_VERSION}/village-chief`,
    DETAIL: (id: string) => `${API_VERSION}/village-chief/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/village-chief/${id}`,
    DELETE: (id: string) => `${API_VERSION}/village-chief/${id}`,
  },
};
