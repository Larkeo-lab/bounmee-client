import { toastGlobal, ToastColor } from "../toast";

export interface ErrorMessageConfig {
  code: string;
  message: string;
  detail: string;
}

export const DEFAULT_ERROR_MESSAGES = {
  // 4xx Client Errors
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    message: "ຄຳຮ້ອງຂໍບໍ່ຖືກຕ້ອງ",
    detail: "ກະລຸນາກວດສອບຂໍ້ມູນທີ່ສົ່ງມາ",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "ບໍ່ໄດ້ຮັບອະນຸຍາດ",
    detail: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "ບໍ່ມີສິດເຂົ້າເຖິງ",
    detail: "ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງຊັບພະຍາກອນນີ້",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "ບໍ່ພົບຂໍ້ມູນ",
    detail: "ບໍ່ພົບຊັບພະຍາກອນທີ່ຕ້ອງການ",
  },
  CONFLICT: {
    code: "CONFLICT",
    message: "ຂໍ້ມູນຊ້ຳກັນ",
    detail: "ຂໍ້ມູນນີ້ມີຢູ່ໃນລະບົບແລ້ວ",
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ",
    detail: "ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນເຂົ້າມາ",
  },
  TOO_MANY_REQUESTS: {
    code: "TOO_MANY_REQUESTS",
    message: "ຄຳຮ້ອງຂໍຫຼາຍເກີນໄປ",
    detail: "ກະລຸນາລໍຖ້າສັກຄູ່ແລ້ວລອງໃໝ່",
  },

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    message: "ເກີດຂໍ້ຜິດພາດຂອງເຊີເວີ",
    detail: "ກະລຸນາລອງໃໝ່ພາຍຫຼັງ ຫຼື ຕິດຕໍ່ຜູ້ດູແລລະບົບ",
  },
  BAD_GATEWAY: {
    code: "BAD_GATEWAY",
    message: "ເຊີເວີບໍ່ຕອບສະໜອງ",
    detail: "ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້",
  },
  SERVICE_UNAVAILABLE: {
    code: "SERVICE_UNAVAILABLE",
    message: "ບໍລິການບໍ່ພ້ອມໃຫ້ບໍລິການ",
    detail: "ລະບົບກຳລັງບຳລຸງຮັກສາ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ",
  },
  GATEWAY_TIMEOUT: {
    code: "GATEWAY_TIMEOUT",
    message: "ເຊີເວີໃຊ້ເວລານານເກີນໄປ",
    detail: "ການເຊື່ອມຕໍ່ໝົດເວລາ ກະລຸນາລອງໃໝ່",
  },
  INCORRECT_PASSWORD: {
    code: "INCORRECT_PASSWORD",
    message: "ຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    detail: "ກະລຸນາກວດສອບຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານຂອງທ່ານແລ້ວລອງໃໝ່",
  },
};

export function showErrorToast(
  error: any,
  customMessage?: string,
  color?: ToastColor,
) {
  let errorCode = "";
  let fallbackMessage = customMessage || "";

  if (typeof error === "string") {
    errorCode = error;
  } else if (error?.response?.data?.code) {
    errorCode = error.response.data.code;
  } else if (error?.response?.data?.message) {
    // Fallback for cases where code is not provided but message is a key
    errorCode = error.response.data.message;
  } else if (error?.message) {
    // Generic Axios error message (e.g. "Network Error")
    if (!fallbackMessage) fallbackMessage = error.message;
  }

  const config =
    DEFAULT_ERROR_MESSAGES[errorCode as keyof typeof DEFAULT_ERROR_MESSAGES];

  toastGlobal({
    title: "ເກີດຂໍ້ຜິດພາດ!",
    description:
      config?.message ||
      fallbackMessage ||
      (typeof error === "string" ? error : "ກະລຸນາລອງໃໝ່ພາຍຫຼັງ"),
    color: color || "danger",
  });
}
