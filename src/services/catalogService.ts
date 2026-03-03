import { apiService } from './apiService';

// The catalog is in the user-service
const API_URL = '/api/catalog';

export interface SubscriptionOffer {
    id?: number;
    name: string;
    description: string;
    subscriptionType: string;
    applicableTransport: string;
    discountPercentage: number;
    price: number;
    validityDays: number;
    active: boolean;
}

export interface PassOffer {
    id?: number;
    name: string;
    description: string;
    passType: string;
    dailyCapAmount: number;
    price: number;
    validityDays: number;
    active: boolean;
}

export const catalogService = {
    // Subscription Offers
    getSubscriptionOffers: async (): Promise<SubscriptionOffer[]> => {
        const response = await apiService.get<SubscriptionOffer[]>(`${API_URL}/subscription-offers`);
        return response.data || [];
    },
    createSubscriptionOffer: async (offer: SubscriptionOffer): Promise<SubscriptionOffer> => {
        const response = await apiService.post<SubscriptionOffer>(`${API_URL}/subscription-offers`, offer);
        if (response.data) return response.data;
        throw new Error(response.error || 'Failed to create subscription offer');
    },
    updateSubscriptionOffer: async (id: number, offer: Partial<SubscriptionOffer>): Promise<SubscriptionOffer> => {
        const response = await apiService.put<SubscriptionOffer>(`${API_URL}/subscription-offers/${id}`, offer);
        if (response.data) return response.data;
        throw new Error(response.error || 'Failed to update subscription offer');
    },
    deleteSubscriptionOffer: async (id: number): Promise<void> => {
        await apiService.delete(`${API_URL}/subscription-offers/${id}`);
    },

    // Pass Offers
    getPassOffers: async (): Promise<PassOffer[]> => {
        const response = await apiService.get<PassOffer[]>(`${API_URL}/pass-offers`);
        return response.data || [];
    },
    createPassOffer: async (offer: PassOffer): Promise<PassOffer> => {
        const response = await apiService.post<PassOffer>(`${API_URL}/pass-offers`, offer);
        if (response.data) return response.data;
        throw new Error(response.error || 'Failed to create pass offer');
    },
    updatePassOffer: async (id: number, offer: Partial<PassOffer>): Promise<PassOffer> => {
        const response = await apiService.put<PassOffer>(`${API_URL}/pass-offers/${id}`, offer);
        if (response.data) return response.data;
        throw new Error(response.error || 'Failed to update pass offer');
    },
    deletePassOffer: async (id: number): Promise<void> => {
        await apiService.delete(`${API_URL}/pass-offers/${id}`);
    }
};
