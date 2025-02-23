import { jwtDecode } from "jwt-decode";
console.log(typeof jwtDecode); // Should log 'function'

export const isAuthenticated = () => {
    console.log('[DEBUG] Checking authentication');
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('[DEBUG] No token found in localStorage');
        return false;
    }

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        console.log('[DEBUG] Token info:', {
            exp: decoded.exp,
            currentTime,
            timeLeft: decoded.exp - currentTime,
            userId: decoded.userId
        });

        if (decoded.exp && decoded.exp < currentTime) {
            console.log('[DEBUG] Token has expired, removing from storage');
            localStorage.removeItem('token');
            return false;
        }
        console.log('[DEBUG] Token is valid');
        return true;
    } catch (error) {
        console.error('[DEBUG] Invalid token:', error);
        localStorage.removeItem('token');
        return false;
    }
};
