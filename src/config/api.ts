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
  REPORT: {
    CREATE: `${API_VERSION}/report`,
    LIST: `${API_VERSION}/report`,
    BY_VILLAGE: (villageId: string) =>
      `${API_VERSION}/report/village/${villageId}`,
    DETAIL: (id: string) => `${API_VERSION}/report/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/report/${id}`,
    MORE_DETAIL: (id: string) => `${API_VERSION}/report/${id}/more-detail`,
    FORWARD: (id: string) => `${API_VERSION}/report/${id}/forward`,
    RECEIVE: (id: string) => `${API_VERSION}/report/${id}/receive`,
    RESOLVE: (id: string) => `${API_VERSION}/report/${id}/resolve`,
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
    REPORTS_LIST: `${API_VERSION}/police-district/reports/list`,
    DEPARTMENT_REPORTS_LIST: `${API_VERSION}/police-district/reports/department/list`,
    VILLAGES_REPORTS: (id: string) =>
      `${API_VERSION}/police-district/${id}/villages`,
    DETAIL: (id: string) => `${API_VERSION}/police-district/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/police-district/${id}`,
    UPDATE_ME: `${API_VERSION}/police-district/me`,
    DELETE: (id: string) => `${API_VERSION}/police-district/${id}`,
  },
  VILLAGE_CHIEF: {
    CREATE: `${API_VERSION}/village-chief`,
    LIST: `${API_VERSION}/village-chief`,
    DETAIL: (id: string) => `${API_VERSION}/village-chief/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/village-chief/${id}`,
    UPDATE_ME: `${API_VERSION}/village-chief/me`,
    DELETE: (id: string) => `${API_VERSION}/village-chief/${id}`,
  },
};
