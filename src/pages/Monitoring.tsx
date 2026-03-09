import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { monitoringService, type ServiceStatus } from '../services/monitoringService';

const Monitoring: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await monitoringService.getServiceStatus();
      setServices(data);
    } catch (e) {
      console.error('Failed to load monitoring data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base-100">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Monitoring Système</h1>
            <button className="btn btn-outline" onClick={load} disabled={loading}>{loading ? '...' : 'Rafraîchir'}</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {services.map(s => (
              <div key={s.service} className={`card p-4 border shadow-sm ${s.status === 'UP' ? 'border-success bg-success/5' : 'border-error bg-error/5'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg capitalize">{s.service}</div>
                    <div className={`text-sm font-bold ${s.status === 'UP' ? 'text-success' : 'text-error'}`}>{s.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm">{s.responseTimeMs ? `${s.responseTimeMs} ms` : '-'}</div>
                    <div className="text-xs opacity-50 italic">latence</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Plateformes d'Observabilité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="card p-6 border border-primary hover:bg-primary/10 transition-colors shadow-md group">
              <div className="text-xl font-black group-hover:text-primary">Grafana</div>
              <div className="text-sm opacity-70">Tableaux de bord & Métriques</div>
            </a>
            <a href="http://localhost:5601" target="_blank" rel="noreferrer" className="card p-6 border border-secondary hover:bg-secondary/10 transition-colors shadow-md group">
              <div className="text-xl font-black group-hover:text-secondary">Kibana</div>
              <div className="text-sm opacity-70">Logs & Analyse (ELK)</div>
            </a>
            <a href="http://localhost:9090" target="_blank" rel="noreferrer" className="card p-6 border border-accent hover:bg-accent/10 transition-colors shadow-md group">
              <div className="text-xl font-black group-hover:text-accent">Prometheus</div>
              <div className="text-sm opacity-70">Base de données temporelle</div>
            </a>
            <a href="http://localhost:9411" target="_blank" rel="noreferrer" className="card p-6 border border-neutral hover:bg-neutral/10 transition-colors shadow-md group">
              <div className="text-xl font-black group-hover:text-neutral">Zipkin</div>
              <div className="text-sm opacity-70">Traçage distribué</div>
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Monitoring;
