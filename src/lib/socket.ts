import { io } from "socket.io-client";

const SOCKET_URL = "http://172.20.10.5:8080";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll manage connection manually or just let it stay disconnected until needed
});
