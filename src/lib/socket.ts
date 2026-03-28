import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll manage connection manually or just let it stay disconnected until needed
});
