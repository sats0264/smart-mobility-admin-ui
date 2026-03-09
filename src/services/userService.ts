import { apiService } from './apiService';

export interface UserProfile {
    keycloakId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    active: boolean;
    suspensionReason?: string;
}

export const userService = {
    // Admin methods
    async getAllUsers(): Promise<UserProfile[]> {
        const response = await apiService.get<UserProfile[]>('/admin/users');
        return response.data || [];
    },

    async suspendUser(userId: string, reason: string): Promise<UserProfile> {
        const response = await apiService.post<UserProfile>(`/admin/users/${userId}/suspend?reason=${encodeURIComponent(reason)}`, null);
        return response.data!;
    },

    async reactivateUser(userId: string): Promise<UserProfile> {
        const response = await apiService.post<UserProfile>(`/admin/users/${userId}/reactivate`, null);
        return response.data!;
    },

    // User summary (includes pass and subscriptions)
    async getUserSummary(userId: string) {
        const response = await apiService.get(`/users/summary/${userId}`);
        return response.data;
    }
};
