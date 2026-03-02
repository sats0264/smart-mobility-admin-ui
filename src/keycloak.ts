import Keycloak from 'keycloak-js';

// Configuration Keycloak pour le frontend admin
const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'smart-mobility',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'smart-mobility-app',
};

const keycloak = new Keycloak(keycloakConfig);

// Ajouter des token update listeners
keycloak.onTokenExpired = () => {
    console.warn('Token expired, attempting refresh...');
    if (keycloak.refreshToken) {
        // @ts-ignore
        keycloak.refreshToken(30).then(() => {
            console.log('Token refreshed successfully');
        }).catch(() => keycloak.login());
    }
};

keycloak.onAuthRefreshSuccess = () => {
    console.log('Token successfully refreshed');
};

keycloak.onAuthRefreshError = () => {
    console.error('Failed to refresh token, redirecting to login');
    keycloak.login().catch(err => console.error('Login failed:', err));
};

export default keycloak;
