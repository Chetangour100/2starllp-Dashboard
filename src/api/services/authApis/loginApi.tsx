import { LoginRequest } from "@/api/types";
import { API_CONFIG } from "@/api/config";
import axios from "axios";


const getDeviceData = () => {
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';

    // Detect device type
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        deviceType = 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'tablet';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('iOS')) {
        os = 'iOS';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
        browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
    } else if (userAgent.includes('Opera')) {
        browser = 'Opera';
    }

    return {
        deviceType,
        os,
        browser,
    };
};

// Get IP address from a public service
const getIPAddress = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unknown';
    }
};

// Get accurate location using multiple methods
const getAccurateLocation = async (ipAddress: string): Promise<{ latitude: number; longitude: number }> => {
    // Method 1: Try browser geolocation first (most accurate)
    try {
        const browserLocation = await getBrowserLocation();
        if (browserLocation) {
            return browserLocation;
        }
    } catch (error) {
        // intentionally left blank
    }

    // Method 2: Try IP-based geolocation
    try {
        const ipLocation = await getLocationFromIP(ipAddress);
        return ipLocation;
    } catch (error) {
        // intentionally left blank
    }

    // Method 3: Fallback to default location
    return {
        latitude: 20.5937,
        longitude: 78.9629,
    };
}

// Get geolocation from browser (if user allows)
const getBrowserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                resolve(coords);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        break;
                    case error.POSITION_UNAVAILABLE:
                        break;
                    case error.TIMEOUT:
                        break;
                    default:
                        break;
                }
                resolve(null);
            },
            {
                enableHighAccuracy: true, // Try to get more accurate location
                timeout: 10000, // 10 seconds timeout
                maximumAge: 300000, // 5 minutes cache
            }
        );
    });
};

// Get location from IP address using multiple services for better accuracy
const getLocationFromIP = async (ip: string): Promise<{ latitude: number; longitude: number }> => {
    try {
        const services = [
            `https://ipapi.co/${ip}/json/`,
            `https://ip-api.com/json/${ip}`,
            `https://freegeoip.app/json/${ip}`
        ];

        for (const serviceUrl of services) {
            try {
                const response = await fetch(serviceUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                // Handle different response formats
                let lat, lng;

                if (data.latitude && data.longitude) {
                    lat = parseFloat(data.latitude);
                    lng = parseFloat(data.longitude);
                } else if (data.lat && data.lon) {
                    lat = parseFloat(data.lat);
                    lng = parseFloat(data.lon);
                } else if (data.lat && data.lng) {
                    lat = parseFloat(data.lat);
                    lng = parseFloat(data.lng);
                }

                if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                    return { latitude: lat, longitude: lng };
                }
            } catch (serviceError) {
                continue;
            }
        }

        throw new Error('All location services failed');
    } catch (error) {
        return {
            latitude: 20.5937, // India center coordinates as fallback
            longitude: 78.9629,
        };
    }
};


export const LoginAPi = async (credentials: LoginRequest) => {
    // Get actual device data
    const deviceData = await getDeviceData();

    // Get IP address
    const ipAddress = await getIPAddress();

    // Get location with multiple fallback methods
    let location = await getAccurateLocation(ipAddress);

    const loginData = {
        ...credentials,
        deviceData,
        ipAddress,
        location,
    };

    const response = await axios.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, loginData);
    return response;
};