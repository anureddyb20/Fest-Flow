/**
 * 🛠️ FestFlow Client Configuration
 * This file serves as the bridge between the deployment .env and the browser.
 */

window.CONFIG = {
    // Firebase Realtime Database Endpoint
    // In production, this can be dynamically replaced during deployment
    API_URL: "https://festflow-38fde-default-rtdb.asia-southeast1.firebasedatabase.app/.json",
    
    // System Defaults
    DEFAULT_ZONE: "Zone 1",
    
    // Auth Metadata (Not for secrets!)
    AUTH_ROLES: {
        ADMIN: "admin",
        PARTNER: "partner"
    }
};
