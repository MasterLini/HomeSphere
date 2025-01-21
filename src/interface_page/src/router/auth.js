import { jwtDecode } from "jwt-decode";
console.log(typeof jwtDecode); // Should log 'function'

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found in localStorage');
        return false;
    }

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token has expired');
            localStorage.removeItem('token');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        return false;
    }
};