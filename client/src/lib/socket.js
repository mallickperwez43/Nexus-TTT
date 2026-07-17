import { io } from "socket.io-client";

// Use dedicated socket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

console.log("🔌 Socket connecting to:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
    withCredentials: true,  // Send cookies
    autoConnect: false,     // Don't connect until user logs in
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});

// Debug logging
socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
});

export default socket;