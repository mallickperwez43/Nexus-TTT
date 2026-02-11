import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. If the error isn't a 401, or we've already tried retrying this specific request
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // 2. IMPORTANT: If the request that failed WAS the refresh call, STOP.
        // This prevents the infinite loop.
        if (originalRequest.url.includes("/user/refresh")) {
            return Promise.reject(error);
        }

        // 3. Mark the request as retried
        originalRequest._retry = true;

        try {
            // Attempt to get a new access token
            await axios.get("http://localhost:5000/api/v1/user/refresh", {
                withCredentials: true,
            });

            // If successful, retry the original request
            return api(originalRequest);
        } catch (refreshError) {
            // If refresh fails, the session is officially dead. 
            // Don't redirect here (it's messy); let the Store handle the state.
            return Promise.reject(refreshError);
        }
    }
);

export default api;