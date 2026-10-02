import { API_CONFIG } from "@/api/config";
import axios from "axios";

// Clear all authentication data from localStorage
const clearLocalStorage = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('user');
};

// Get access token
const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const LogoutApi = () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
        // Clear local storage only
        clearLocalStorage();
        return { success: true, message: 'Logged out successfully' };
    }

    const response = axios.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    });

    return response;
};