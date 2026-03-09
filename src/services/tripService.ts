import { apiService } from './apiService';

export interface Trip {
    id: number;
    userId: string;
    transportType: string;
    transportLineId?: number;
    startTime: string;
    startLocation: string;
    endTime?: string;
    endLocation?: string;
    status: 'STARTED' | 'COMPLETED' | 'COMPLETED_MISMATCH' | 'CANCELLED';
    // Enriched by cross-referencing billing data
    price?: number;
}

export const tripService = {
    async getAllTrips(): Promise<Trip[]> {
        const response = await apiService.get<Trip[]>('/admin/trips/all');
        return response.data || [];
    },

    async getTripsByUser(userId: string): Promise<Trip[]> {
        const response = await apiService.get<Trip[]>(`/admin/trips/user/${userId}`);
        return response.data || [];
    },

    async cancelTrip(id: number): Promise<Trip> {
        const response = await apiService.post<Trip>(`/admin/trips/${id}/cancel`, null);
        return response.data!;
    }
};
