import { create } from "zustand";
import api from "../lib/axios";

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,

    // Signup logic
    signup: async (data) => {
        try {
            const res = await api.post("/user/signup", data);
            return { success: true, message: res.data.message };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Signup failed" };
        }
    },

    // Login logic
    login: async (data) => {
        try {
            const res = await api.post("/user/login", data);
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }
            if (res.data.refreshToken) {
                localStorage.setItem("refreshToken", res.data.refreshToken);
            }
            set({ user: res.data.user, isAuthenticated: true });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Login failed" };
        }
    },

    // Check if user is already logged in (runs on app refresh)
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await api.get("/user/me");
            set({ user: res.data.user, isAuthenticated: true });
        } catch (err) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // Logout logic
    logout: async () => {
        try {
            await api.post("/user/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            set({ user: null, isAuthenticated: false });
        } catch (err) {
            console.error("Logout failed", err);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            set({ user: null, isAuthenticated: false });
        }
    },
}));