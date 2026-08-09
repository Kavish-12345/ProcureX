import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // sends cookies automatically with every request
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
}

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying and not the refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            if (isRefreshing) {
                // If already refreshing, queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => client(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await client.post('/auth/refresh');
                processQueue(null);
                return client(originalRequest); // retry original request
            } catch (refreshError) {
                processQueue(refreshError);
                useAuthStore.getState().clearUser();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default client;

