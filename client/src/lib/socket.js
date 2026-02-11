import { io } from "socket.io-client";

// Fallback to localhost if the env variable is missing
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: false,
});