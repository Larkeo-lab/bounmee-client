import { io } from "socket.io-client";
import { API_BASE_URL } from "@/lib/axios";

// โยง Socket เข้ากับ IP เครื่องที่ตั้ง API ไว้
const SOCKET_URL = API_BASE_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
