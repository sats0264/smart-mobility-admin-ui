const API_URL = 'http://localhost:8080/admin'; // TODO: Update to gateway/real URL in prod

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
    priceIncrement: number;
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
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const pricingService = {
    // Transport Lines
    getTransportLines: async (): Promise<TransportLine[]> => {
        try {
            const response = await fetch(`${API_URL}/transport-lines`);
            if (!response.ok) throw new Error('Failed to fetch transport lines');
            return response.json();
        } catch (error) {
            console.error('Error fetching transport lines:', error);

            const zone1 = ['Petersen', 'Grande Mosquée', 'Place de la Nation', 'Dial Diop', 'Grand Dakar', 'Liberté 1', 'Sacré Coeur', 'Liberté 5', 'Liberté 6'];
            const zone2 = ['Khar Yalla', 'Scat Urbam', 'Cardinal Hyacinthe Thiandoum', 'Grand Médine', 'Police Parcelles', 'Croisement 22'];
            const zone3 = ['Parcelles', 'Ndingala', 'Golf Sud', 'Dalal Jam', 'Fith Mith', 'Golf Nord', 'Gueule Tapée', 'Guédiawaye'];

            // Fallback data for UI testing if backend is down
            return [
                { id: 1, name: 'Ligne 1: Palais - Ouakam', transportType: 'BUS' },
                { id: 2, name: 'Ligne 7: Thiaroye - Petersen', transportType: 'BUS' },
                { id: 3, name: 'Ligne 218: Keur Massar - Dakar', transportType: 'BUS' },
                { id: 4, name: 'Ligne B1 (Omnibus)', transportType: 'BRT', stations: [...zone1, ...zone2, ...zone3] },
                { id: 5, name: 'Ligne B2 (Express)', transportType: 'BRT', stations: ['Petersen', 'Place de la Nation', 'Grand Dakar', 'Sacré Coeur', 'Grand Médine', 'Dalal Jam', 'Guédiawaye'] },
                { id: 6, name: 'Ligne B3 (Express)', transportType: 'BRT', stations: ['Petersen', 'Place de la Nation', 'Khar Yalla', 'Croisement 22', 'Parcelles', 'Gueule Tapée', 'Guédiawaye'] }
            ];
        }
    },

    createTransportLine: async (line: TransportLine): Promise<TransportLine> => {
        try {
            const response = await fetch(`${API_URL}/transport-lines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(line),
            });
            if (!response.ok) throw new Error('Failed to create transport line');
            return response.json();
        } catch (error) {
            console.error('Error creating transport line:', error);
            throw error;
        }
    },

    // Fare Sections
    getFareSections: async (): Promise<FareSection[]> => {
        try {
            const response = await fetch(`${API_URL}/fare-sections`);
            if (!response.ok) throw new Error('Failed to fetch fare sections');
            return response.json();
        } catch (error) {
            console.error('Error fetching fare sections:', error);
            return [];
        }
    },

    createFareSection: async (section: FareSection): Promise<FareSection> => {
        try {
            const response = await fetch(`${API_URL}/fare-sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(section),
            });
            if (!response.ok) throw new Error('Failed to create fare section');
            return response.json();
        } catch (error) {
            console.error('Error creating fare section:', error);
            throw error;
        }
    },

    // Zones
    getZones: async (): Promise<Zone[]> => {
        try {
            const response = await fetch(`${API_URL}/zones`);
            if (!response.ok) throw new Error('Failed to fetch zones');
            return response.json();
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
        try {
            const response = await fetch(`${API_URL}/zones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zone),
            });
            if (!response.ok) throw new Error('Failed to create zone');
            return response.json();
        } catch (error) {
            console.error('Error creating zone:', error);
            throw error;
        }
    },

    // Discount Rules
    getDiscountRules: async (): Promise<DiscountRule[]> => {
        try {
            const response = await fetch(`${API_URL}/discount-rules`);
            if (!response.ok) throw new Error('Failed to fetch discount rules');
            return response.json();
        } catch (error) {
            console.error('Error fetching discount rules:', error);
            return [
                { id: 1, ruleType: 'OFFPEAK', percentage: 20, priority: 2, condition: 'BRT', active: true },
                { id: 2, ruleType: 'LOYALTY', percentage: 10, priority: 3, condition: 'ALL', active: true }
            ];
        }
    },

    createDiscountRule: async (rule: Partial<DiscountRule>): Promise<DiscountRule> => {
        try {
            const response = await fetch(`${API_URL}/discount-rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule),
            });
            if (!response.ok) throw new Error('Failed to create discount rule');
            return response.json();
        } catch (error) {
            console.error('Error creating discount rule:', error);
            throw error;
        }
    },

    deleteDiscountRule: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/discount-rules/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete discount rule');
        } catch (error) {
            console.error('Error deleting discount rule:', error);
            throw error;
        }
    }
};
