import { apiService } from './apiService';

export type NotificationType = 'ANNOUNCEMENT' | 'MAINTENANCE' | 'NETWORK_ALERT' | 'PAYMENT' | 'ACCOUNT_CREDITED' | 'LOW_BALANCE' | 'INFO';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Notification {
    id: number;
    userId: string;
    referenceId?: string;
    referenceType?: string;
    type: NotificationType;
    channel: NotificationChannel;
    message: string;
    status: NotificationStatus;
    errorReason?: string;
    idempotencyKey?: string;
    createdAt: string;
}

export interface BroadcastRequest {
    title: string;
    message: string;
    type: 'ANNOUNCEMENT' | 'MAINTENANCE' | 'NETWORK_ALERT';
}

export const notificationService = {
    async getAllNotifications(): Promise<Notification[]> {
        const response = await apiService.get<Notification[]>('/admin/notifications/all');
        return response.data || [];
    },

    async getBroadcasts(): Promise<Notification[]> {
        const response = await apiService.get<Notification[]>('/admin/notifications/broadcasts');
        return response.data || [];
    },

    async sendBroadcast(request: BroadcastRequest): Promise<Notification> {
        const response = await apiService.post<Notification>('/admin/notifications/broadcast', request);
        return response.data!;
    }
};
