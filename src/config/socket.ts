import { io } from "socket.io-client";
import { API_ENDPOINTS } from "./api";

//const SOCKET_URL = "http://localhost:8086";
const SOCKET_URL = API_ENDPOINTS.SOCKET.LISTEN;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
