import { API_CONFIG } from "@/api/config";
import axios from "axios";


export const verifyOtpApi = async (data: any) => {
    const baseUrl = API_CONFIG.BASE_URL;

    const url = data?.userId
        ? `${baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE_PASSWORD_VERIFY_OTP}?userId=${data?.userId}`
        : `${baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE_PASSWORD_VERIFY_OTP}`;

    const response = await axios.post(url, data);

    return response;
};