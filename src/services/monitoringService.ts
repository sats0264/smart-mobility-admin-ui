import { apiService } from './apiService';

export type ServiceHealth = {
  status: string;
  components?: Record<string, any>;
};

export type ServiceStatus = {
  service: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  responseTimeMs?: number | null;
};

const SERVICES = [
  { name: 'gateways', url: '/actuator/health' },
  { name: 'billing-service', url: '/billing-service/actuator/health' },
  { name: 'pricing-discount-service', url: '/pricing-discount-service/actuator/health' },
  { name: 'trip-management-service', url: '/trip-management-service/actuator/health' },
  { name: 'user-mobility-pass-service', url: '/user-mobility-pass-service/actuator/health' },
  { name: 'notification-service', url: '/notification-service/actuator/health' },
  { name: 'keycloak', url: '/infra/keycloak/realms/master' },
  { name: 'rabbitmq', url: '/infra/rabbitmq' },
  { name: 'zipkin', url: '/infra/zipkin/actuator/health' },
  { name: 'prometheus', url: '/infra/prometheus/-/healthy' },
  { name: 'grafana', url: '/infra/grafana/api/health' },
  { name: 'elasticsearch', url: '/infra/elasticsearch' },
  { name: 'kibana', url: '/infra/kibana/api/status' },
];

export const monitoringService = {
  async getServiceStatus(): Promise<ServiceStatus[]> {
    const results: ServiceStatus[] = [];

    for (const svc of SERVICES) {
      const start = Date.now();
      try {
        const endpoint = (svc.url.startsWith('http') || svc.url.startsWith('/'))
          ? svc.url
          : `/${svc.name}${svc.url}`;
        const resp = await apiService.get<ServiceHealth>(endpoint);
        const elapsed = Date.now() - start;

        if (resp.error) {
          results.push({ service: svc.name, status: 'DOWN', responseTimeMs: null });
        } else {
          // Logic for external services or Spring services
          const isSpringSvc = !svc.url.startsWith('http');
          const status = (resp.data?.status || 'UNKNOWN') as string;

          let finalStatus: 'UP' | 'DOWN' = 'DOWN';
          if (isSpringSvc) {
            finalStatus = status === 'UP' ? 'UP' : 'DOWN';
          } else {
            // For external (Keycloak, ES, etc.), if we got a response without error, it's UP
            finalStatus = 'UP';
          }

          results.push({ service: svc.name, status: finalStatus, responseTimeMs: elapsed });
        }
      } catch (e) {
        results.push({ service: svc.name, status: 'DOWN', responseTimeMs: null });
      }
    }

    return results;
  },
};
