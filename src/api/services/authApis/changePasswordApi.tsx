import { API_CONFIG } from "@/api/config";
import axios from "axios";

export interface ChangePasswordRequest {
    userId: string | number;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};
const baseUrl = API_CONFIG.BASE_URL;

export const changePasswordApi = async (passwordData: ChangePasswordRequest) => {
    const userId = passwordData?.userId;
    const url = userId
        ? `${baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE_PASSWORD}?userId=${userId}`
        : `${baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE_PASSWORD}`;

    const response = await axios.put(url, passwordData);
    return response;
};