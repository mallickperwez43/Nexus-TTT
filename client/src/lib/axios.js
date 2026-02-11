import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

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
            // Use the base URL variable here too!
            await axios.get(`${baseURL}/user/refresh`, {
                withCredentials: true,
            });

            return api(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);

export default api;