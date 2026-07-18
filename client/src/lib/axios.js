import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url.includes("/user/refresh")) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const rfToken = localStorage.getItem("refreshToken");
            const headers = {};
            if (rfToken) {
                headers["x-refresh-token"] = rfToken;
                headers["Authorization"] = `Bearer${rfToken}`;
            }

            const res = await axios.get(`${baseURL}/user/refresh`, {
                withCredentials: true,
                headers: headers
            });

            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
            }

            return api(originalRequest);
        } catch (refreshError) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return Promise.reject(refreshError);
        }
    }
);

export default api;