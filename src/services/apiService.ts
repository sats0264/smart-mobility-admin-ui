import keycloak from '../keycloak';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8765';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Service API pour centraliser les appels HTTP avec authentification
 */
class ApiService {
  private getAuthHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Rafraîchir le token si nécessaire
      if (keycloak.isTokenExpired()) {
        await keycloak.updateToken(30);
      }

      const headers = {
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Token expired, attempting to refresh...');
          keycloak.login();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`API Error on ${endpoint}:`, errorMessage);
      return { error: errorMessage, status: 0 };
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
