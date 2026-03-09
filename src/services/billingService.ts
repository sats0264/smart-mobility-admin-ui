import { apiService } from './apiService';

export interface Account {
    id: number;
    userId: string;
    balance: number;
    dailySpent: number;
    currency: string;
}

export interface Transaction {
    id: number;
    accountId: number;
    tripId?: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    description?: string;
    createdAt: string;
}

export interface BillingStats {
    totalAccounts: number;
    totalBalance: number;
    totalRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
}

export const billingService = {
    async getStats(): Promise<BillingStats> {
        const response = await apiService.get<BillingStats>('/admin/billing/stats');
        return response.data!;
    },

    async getTransactions(): Promise<Transaction[]> {
        const response = await apiService.get<Transaction[]>('/admin/billing/transactions');
        return response.data || [];
    },

    async getAllAccounts(): Promise<Account[]> {
        const response = await apiService.get<Account[]>('/admin/billing/accounts');
        return response.data || [];
    }
};
