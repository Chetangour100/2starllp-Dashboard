import { API_CONFIG } from "@/api/config";
import axios from "axios";


export const verify2FAApi = async (otpData: {}) => {
    const response = await axios.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA,
        otpData
    );

    return response;
};