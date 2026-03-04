import { apiService } from './apiService';

const API_URL = '/admin';

export interface TransportLine {
    id?: number;
    name: string;
    transportType: 'BUS' | 'BRT' | 'TER';
    stations?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface FareSection {
    id?: number;
    lineId: number;
    sectionOrder: number;
    stationName?: string;
    zone?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Zone {
    id?: number;
    zoneNumber: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DiscountRule {
    id?: number;
    ruleType: string;
    percentage: number;
    priority: number;
    condition: string;
    startHour?: string;
    endHour?: string;
    startDay?: number;
    endDay?: number;
    startDate?: string;
    endDate?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const pricingService = {
    // Transport Lines
    getTransportLines: async (): Promise<TransportLine[]> => {
        try {
            const response = await apiService.get<TransportLine[]>(`${API_URL}/transport-lines`);
            if (response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fetch transport lines');
        } catch (error) {
            console.error('Error fetching transport lines:', error);
            // Fallback data for UI testing if backend is down
            const zone1 = ['Petersen', 'Grande Mosquée', 'Place de la Nation', 'Dial Diop', 'Grand Dakar', 'Liberté 1', 'Sacré Coeur', 'Liberté 5', 'Liberté 6'];
            const zone2 = ['Khar Yalla', 'Scat Urbam', 'Cardinal Hyacinthe Thiandoum', 'Grand Médine', 'Police Parcelles', 'Croisement 22'];
            const zone3 = ['Parcelles', 'Ndingala', 'Golf Sud', 'Dalal Jam', 'Fith Mith', 'Golf Nord', 'Gueule Tapée', 'Guédiawaye'];
            const terStations = ['Dakar', 'Colobane', 'Hann', 'Baux Maraîchers', 'Pikine', 'Thiaroye', 'Yeumbeul', 'Keur Massar', 'Rufisque', 'Bargny', 'Diamniadio'];

            return [
                { id: 1, name: 'Ligne 1: Palais - Ouakam', transportType: 'BUS' },
                { id: 2, name: 'Ligne 7: Thiaroye - Petersen', transportType: 'BUS' },
                { id: 3, name: 'Ligne 218: Keur Massar - Dakar', transportType: 'BUS' },
                { id: 4, name: 'Ligne B1 (Omnibus)', transportType: 'BRT', stations: [...zone1, ...zone2, ...zone3] },
                { id: 5, name: 'Ligne B2 (Express)', transportType: 'BRT', stations: ['Petersen', 'Place de la Nation', 'Grand Dakar', 'Sacré Coeur', 'Grand Médine', 'Dalal Jam', 'Guédiawaye'] },
                { id: 6, name: 'Ligne B3 (Express)', transportType: 'BRT', stations: ['Petersen', 'Place de la Nation', 'Khar Yalla', 'Croisement 22', 'Parcelles', 'Gueule Tapée', 'Guédiawaye'] },
                { id: 7, name: 'TER: Ligne de la Banlieue', transportType: 'TER', stations: terStations }
            ];
        }
    },

    createTransportLine: async (line: TransportLine): Promise<TransportLine> => {
        const response = await apiService.post<TransportLine>(`${API_URL}/transport-lines`, line);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to create transport line');
    },

    updateTransportLine: async (id: number, line: Partial<TransportLine>): Promise<TransportLine> => {
        const response = await apiService.put<TransportLine>(`${API_URL}/transport-lines/${id}`, line);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to update transport line');
    },

    deleteTransportLine: async (id: number): Promise<void> => {
        const response = await apiService.delete(`${API_URL}/transport-lines/${id}`);
        if (response.status !== 0 && response.status < 400) {
            return;
        }
        throw new Error(response.error || 'Failed to delete transport line');
    },

    // Fare Sections
    getFareSections: async (): Promise<FareSection[]> => {
        const response = await apiService.get<FareSection[]>(`${API_URL}/fare-sections`);
        return response.data || [];
    },

    createFareSection: async (section: FareSection): Promise<FareSection> => {
        const response = await apiService.post<FareSection>(`${API_URL}/fare-sections`, section);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to create fare section');
    },

    updateFareSection: async (id: number, section: Partial<FareSection>): Promise<FareSection> => {
        const response = await apiService.put<FareSection>(`${API_URL}/fare-sections/${id}`, section);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to update fare section');
    },

    deleteFareSection: async (id: number): Promise<void> => {
        const response = await apiService.delete(`${API_URL}/fare-sections/${id}`);
        if (response.status !== 0 && response.status < 400) {
            return;
        }
        throw new Error(response.error || 'Failed to delete fare section');
    },

    // Zones
    getZones: async (): Promise<Zone[]> => {
        try {
            const response = await apiService.get<Zone[]>(`${API_URL}/zones`);
            if (response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fetch zones');
        } catch (error) {
            console.error('Error fetching zones:', error);
            // Fallback data
            return [
                { id: 1, zoneNumber: 1 },
                { id: 2, zoneNumber: 2 },
                { id: 3, zoneNumber: 3 }
            ];
        }
    },

    createZone: async (zone: Zone): Promise<Zone> => {
        const response = await apiService.post<Zone>(`${API_URL}/zones`, zone);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to create zone');
    },

    // Discount Rules
    getDiscountRules: async (): Promise<DiscountRule[]> => {
        try {
            const response = await apiService.get<DiscountRule[]>(`${API_URL}/discount-rules`);
            if (response.data) {
                return response.data;
            }
            throw new Error(response.error || 'Failed to fetch discount rules');
        } catch (error) {
            console.error('Error fetching discount rules:', error);
            return [
                { id: 1, ruleType: 'OFFPEAK', percentage: 20, priority: 2, condition: 'BRT', active: true },
                { id: 2, ruleType: 'LOYALTY', percentage: 10, priority: 3, condition: 'ALL', active: true }
            ];
        }
    },

    createDiscountRule: async (rule: Partial<DiscountRule>): Promise<DiscountRule> => {
        const response = await apiService.post<DiscountRule>(`${API_URL}/discount-rules`, rule);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to create discount rule');
    },

    deleteDiscountRule: async (id: number): Promise<void> => {
        const response = await apiService.delete(`${API_URL}/discount-rules/${id}`);
        if (response.status !== 0 && response.status < 400) {
            return;
        }
        throw new Error(response.error || 'Failed to delete discount rule');
    },

    updateDiscountRule: async (id: number, rule: Partial<DiscountRule>): Promise<DiscountRule> => {
        const response = await apiService.put<DiscountRule>(`${API_URL}/discount-rules/${id}`, rule);
        if (response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to update discount rule');
    }
};
