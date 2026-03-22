const API_VERSION = "/api/v1";
export const API_ENDPOINTS = {
  USER: {
    KYC: `${API_VERSION}/user/kyc`,
  },
  MASTER_DATA: {
    NEWS: `${API_VERSION}/master-data/news`,
    FAQ: `${API_VERSION}/master-data/faq`,
    THEME: `${API_VERSION}/master-data/theme`,
    FEEDBACK: `${API_VERSION}/master-data/feedback`,
    BANNER: `${API_VERSION}/master-data/banner`,
    // ຄູ່ມືການນຳໃຊ້ (ຖ້າ backend ໃຊ້ master-data ປ່ຽນເປັນ master-data/manual)
    MANUAL: `${API_VERSION}/master-data/manual`,
    GOVERNMENT_SERVICE: `${API_VERSION}/master-data/government-service`,
    ORGANIZATION: `${API_VERSION}/master-data/organizations`,
    NOTIFICATIONS: `${API_VERSION}/master-data/notifications`,
  },
  SERVICES: {
    LIST: `${API_VERSION}/core/services`,
  },
  STORAGE: {
    IMAGE: `${API_VERSION}/storage/image/upload`,
    FILE: `${API_VERSION}/storage/upload-stream`,
    DELETE_IMAGE: `${API_VERSION}/storage/image`,
  },
  QUEUES: {
    LIST: `${API_VERSION}/core/queues`,
    DETAIL: (id: string) => `${API_VERSION}/core/queues/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/core/queues/${id}`,
    RESET: `${API_VERSION}/core/queues/reset`,
  },
  SERVICE_CENTER: {
    LIST: `${API_VERSION}/master-data/service-center`,
  },
  SOCKET: {
    LISTEN: `${API_VERSION}/socket`,
  },
};

// const CORE_URL = "http://localhost:8084";
// const MASTER_DATA_URL = "http://localhost:8083";
// const ROLE_URL = "http://localhost:8082";

// const API_VERSION = "/api/v1";
// export const API_ENDPOINTS = {
//   USER: {
//     KYC: `${API_VERSION}/user/kyc`,
//   },
//   MASTER_DATA: {
//     NEWS: `${API_VERSION}/master-data/news`,
//     FAQ: `${API_VERSION}/master-data/faq`,
//     THEME: `${API_VERSION}/master-data/theme`,
//     FEEDBACK: `${API_VERSION}/master-data/feedback`,
//     BANNER: `${API_VERSION}/master-data/banner`,
//     // ຄູ່ມືການນຳໃຊ້ (ຖ້າ backend ໃຊ້ master-data ປ່ຽນເປັນ master-data/manual)
//     MANUAL: `${API_VERSION}/master-data/manual`,
//     GOVERNMENT_SERVICE: `${API_VERSION}/master-data/government-service`,
//     ORGANIZATION: `${API_VERSION}/master-data/organizations`,
//     NOTIFICATIONS: `${API_VERSION}/master-data/notifications`,
//   },
//   SERVICES: {
//     LIST: `${API_VERSION}/core/services`,
//   },
//   STORAGE: {
//     IMAGE: `${API_VERSION}/storage/image/upload`,
//     FILE: `${API_VERSION}/storage/upload-stream`,
//     DELETE_IMAGE: `${API_VERSION}/storage/image`,
//   },
//   QUEUES: {
//     LIST: `${CORE_URL}${API_VERSION}/queues`,
//     DETAIL: (id: string) => `${CORE_URL}${API_VERSION}/queues/${id}`,
//     UPDATE: (id: string) => `${CORE_URL}${API_VERSION}/queues/${id}`,
//   },
//   SERVICE_CENTER: {
//     LIST: `${MASTER_DATA_URL}${API_VERSION}/service-center`,
//   },
//   ROLE: {
//     LIST: `${ROLE_URL}${API_VERSION}/role`,
//   },
// };
