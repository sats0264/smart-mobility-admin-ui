import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { tripService } from '../services/tripService';
import type { Trip } from '../services/tripService';
import { billingService } from '../services/billingService';
import type { Transaction } from '../services/billingService';

type StatusFilter = 'ALL' | 'STARTED' | 'COMPLETED' | 'COMPLETED_MISMATCH' | 'CANCELLED';

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
    STARTED: { label: 'En cours', cls: 'badge-warning', dot: 'bg-warning animate-pulse' },
    COMPLETED: { label: 'Terminé', cls: 'badge-success', dot: 'bg-success' },
    COMPLETED_MISMATCH: { label: 'Anomalie', cls: 'badge-error', dot: 'bg-error animate-pulse' },
    CANCELLED: { label: 'Annulé', cls: 'badge-neutral', dot: 'bg-base-content/30' },
};

const transportIcon: Record<string, string> = {
    BUS: '🚌',
    BRT: '⚡',
    TER: '🚆',
};

function durationMinutes(start: string, end?: string): string {
    if (!end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const min = Math.round(ms / 60000);
    return `${min} min`;
}

const TripManagement: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [searchParams] = useSearchParams();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedTrips, fetchedTx] = await Promise.all([
                tripService.getAllTrips(),
                billingService.getTransactions()
            ]);
            setTrips(fetchedTrips);
            setTransactions(fetchedTx);
        } catch (err) {
            console.error('Failed to load trip data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const userIdParam = searchParams.get('userId');
        if (userIdParam) {
            setSearchTerm(userIdParam);
        }
    }, [searchParams]);

    // Build a lookup: tripId (string) -> transaction
    const txByTripId = useMemo(() => {
        const map: Record<string, Transaction> = {};
        transactions.forEach(tx => {
            if (tx.tripId) map[tx.tripId] = tx;
        });
        return map;
    }, [transactions]);

    const enrichedTrips = useMemo(() =>
        trips.map(t => ({
            ...t,
            price: txByTripId[String(t.id)]?.amount,
        })),
        [trips, txByTripId]
    );

    const filtered = useMemo(() => {
        let result = enrichedTrips;
        if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter);
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.userId.toLowerCase().includes(q) ||
                t.startLocation?.toLowerCase().includes(q) ||
                t.endLocation?.toLowerCase().includes(q) ||
                String(t.id).includes(q)
            );
        }
        return result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [enrichedTrips, statusFilter, searchTerm]);

    const handleCancel = async (trip: Trip) => {
        if (!window.confirm(`Annuler le trajet #${trip.id} de l'utilisateur ${trip.userId} ?`)) return;
        setIsCancelling(true);
        try {
            await tripService.cancelTrip(trip.id);
            await loadData();
            if (selectedTrip?.id === trip.id) {
                setSelectedTrip(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
            }
        } catch (err) {
            alert('Erreur lors de l\'annulation du trajet.');
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (s: string) =>
        new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const formatCurrency = (n?: number) =>
        n != null ? new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(n) : '—';

    // Stats
    const stats = useMemo(() => ({
        total: trips.length,
        active: trips.filter(t => t.status === 'STARTED').length,
        completed: trips.filter(t => t.status === 'COMPLETED').length,
        anomalies: trips.filter(t => t.status === 'COMPLETED_MISMATCH').length,
    }), [trips]);

    return (
        <div className="min-h-screen flex flex-col bg-base-100">
            <Navbar />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                Gestion des <span className="text-primary">Trajets</span>
                            </h1>
                            <p className="opacity-60 text-sm mt-1 uppercase font-bold tracking-widest">
                                Supervision et modération des voyages MaaS
                            </p>
                        </div>
                        <button onClick={loadData} disabled={isLoading} className="btn btn-outline btn-primary shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Actualiser
                        </button>
                    </div>

                    {/* KPI Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total', value: stats.total, cls: 'text-base-content', border: 'border-base-300' },
                            { label: 'En cours', value: stats.active, cls: 'text-warning', border: 'border-warning/30' },
                            { label: 'Terminés', value: stats.completed, cls: 'text-success', border: 'border-success/30' },
                            { label: 'Anomalies', value: stats.anomalies, cls: 'text-error', border: 'border-error/30' },
                        ].map(s => (
                            <div key={s.label} className={`stat bg-base-200 rounded-2xl shadow border ${s.border} p-4`}>
                                <div className="stat-title text-xs uppercase tracking-widest font-bold opacity-50">{s.label}</div>
                                <div className={`stat-value text-3xl font-black ${s.cls}`}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Trip Table */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="join shadow-sm flex-1 min-w-[200px]">
                                    <input
                                        className="input input-sm join-item bg-base-200 border-none w-full"
                                        placeholder="Rechercher (User ID, arrêt, #ID)…"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <button className="btn btn-sm join-item btn-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </button>
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {(['ALL', 'STARTED', 'COMPLETED', 'COMPLETED_MISMATCH', 'CANCELLED'] as StatusFilter[]).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`btn btn-xs rounded-full font-bold ${statusFilter === s ? 'btn-primary' : 'btn-ghost opacity-60 hover:opacity-100'}`}
                                        >
                                            {s === 'ALL' ? 'Tous' : statusConfig[s]?.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                </div>
                            ) : (
                                <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead>
                                                <tr className="bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-black">
                                                    <th className="p-4">Trajet</th>
                                                    <th>Mode</th>
                                                    <th>Origine → Destination</th>
                                                    <th>Date</th>
                                                    <th>Durée</th>
                                                    <th>Prix</th>
                                                    <th>Statut</th>
                                                    <th className="text-right p-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map(trip => {
                                                    const cfg = statusConfig[trip.status] || statusConfig['CANCELLED'];
                                                    return (
                                                        <tr
                                                            key={trip.id}
                                                            onClick={() => setSelectedTrip(trip)}
                                                            className={`hover:bg-primary/5 cursor-pointer transition-colors border-b border-base-300/30 last:border-0 group ${selectedTrip?.id === trip.id ? 'bg-primary/10' : ''}`}
                                                        >
                                                            <td className="p-4">
                                                                <div className="font-black text-sm">#{trip.id}</div>
                                                                <div className="text-[10px] font-mono opacity-40 truncate max-w-[90px]">{trip.userId}</div>
                                                            </td>
                                                            <td>
                                                                <span className="text-xl">{transportIcon[trip.transportType] || '🚍'}</span>
                                                                <div className="text-[9px] font-bold opacity-40 uppercase">{trip.transportType}</div>
                                                            </td>
                                                            <td className="text-xs font-semibold">
                                                                <div className="truncate max-w-[140px]">
                                                                    <span className="opacity-70">{trip.startLocation || '—'}</span>
                                                                    {trip.endLocation && (
                                                                        <> <span className="opacity-30 mx-1">→</span> <span className="text-primary">{trip.endLocation}</span></>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="text-[10px] font-mono opacity-60 whitespace-nowrap">{formatDate(trip.startTime)}</td>
                                                            <td className="text-xs font-bold opacity-60 whitespace-nowrap">{durationMinutes(trip.startTime, trip.endTime)}</td>
                                                            <td className={`text-xs font-black whitespace-nowrap ${trip.price != null ? 'text-success' : 'opacity-30'}`}>
                                                                {formatCurrency(trip.price)}
                                                            </td>
                                                            <td>
                                                                <div className={`badge badge-sm ${cfg.cls} font-bold text-[9px] whitespace-nowrap`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1 inline-block`}></span>
                                                                    {cfg.label}
                                                                </div>
                                                            </td>
                                                            <td className="text-right p-4">
                                                                {(trip.status === 'STARTED' || trip.status === 'COMPLETED_MISMATCH') && (
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); handleCancel(trip); }}
                                                                        disabled={isCancelling}
                                                                        className="btn btn-xs btn-error btn-outline opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                                                        title="Annuler le trajet"
                                                                    >
                                                                        Annuler
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filtered.length === 0 && (
                                                    <tr>
                                                        <td colSpan={8} className="py-20 text-center opacity-30 italic font-semibold">
                                                            Aucun trajet trouvé avec ces filtres.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-3 border-t border-base-300/50 bg-base-300/20 text-right">
                                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                                            {filtered.length} / {trips.length} trajets affichés
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Trip Detail Panel */}
                        <div className="lg:col-span-1">
                            {selectedTrip ? (
                                <div className="card bg-base-200 shadow-xl border border-primary/20 sticky top-8">
                                    <div className="card-body p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-black">Trajet <span className="text-primary">#{selectedTrip.id}</span></h2>
                                            <div className={`badge ${statusConfig[selectedTrip.status]?.cls || 'badge-neutral'} font-bold`}>
                                                {statusConfig[selectedTrip.status]?.label}
                                            </div>
                                        </div>

                                        {/* Alert for anomaly */}
                                        {selectedTrip.status === 'COMPLETED_MISMATCH' && (
                                            <div className="alert alert-error text-xs py-2 mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                <span>Ligne de transport invalide à la sortie. Vérifier la facturation.</span>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {/* User ID */}
                                            <div className="bg-base-300 rounded-xl p-3">
                                                <div className="text-[10px] uppercase font-black opacity-40 mb-1">Utilisateur</div>
                                                <div className="font-mono text-xs font-bold text-primary break-all">{selectedTrip.userId}</div>
                                            </div>

                                            {/* Transport */}
                                            <div className="bg-base-300 rounded-xl p-3 flex items-center gap-3">
                                                <span className="text-2xl">{transportIcon[selectedTrip.transportType] || '🚍'}</span>
                                                <div>
                                                    <div className="text-[10px] uppercase font-black opacity-40 mb-0.5">Mode de Transport</div>
                                                    <div className="font-bold text-sm">{selectedTrip.transportType}</div>
                                                    {selectedTrip.transportLineId && (
                                                        <div className="text-[10px] opacity-40 font-mono">Ligne #{selectedTrip.transportLineId}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div className="bg-base-300 rounded-xl p-3">
                                                <div className="text-[10px] uppercase font-black opacity-40 mb-2">Itinéraire</div>
                                                <div className="flex items-start gap-2">
                                                    <div className="flex flex-col items-center pt-1 gap-1">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                                                        <span className="w-0.5 h-6 bg-base-content/20 rounded"></span>
                                                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-3">
                                                        <div>
                                                            <div className="text-[9px] opacity-40 uppercase">Départ</div>
                                                            <div className="font-bold text-sm">{selectedTrip.startLocation || '—'}</div>
                                                            <div className="text-[9px] font-mono opacity-40">{formatDate(selectedTrip.startTime)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] opacity-40 uppercase">Arrivée</div>
                                                            <div className="font-bold text-sm">{selectedTrip.endLocation || '—'}</div>
                                                            {selectedTrip.endTime && (
                                                                <div className="text-[9px] font-mono opacity-40">{formatDate(selectedTrip.endTime)}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Duration & Price */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-base-300 rounded-xl p-3 text-center">
                                                    <div className="text-[10px] uppercase font-black opacity-40 mb-1">Durée</div>
                                                    <div className="font-black text-lg">{durationMinutes(selectedTrip.startTime, selectedTrip.endTime)}</div>
                                                </div>
                                                <div className="bg-base-300 rounded-xl p-3 text-center">
                                                    <div className="text-[10px] uppercase font-black opacity-40 mb-1">Facturé</div>
                                                    <div className={`font-black text-lg ${selectedTrip.price != null ? 'text-success' : 'opacity-30'}`}>
                                                        {formatCurrency(selectedTrip.price)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="divider text-[10px] uppercase opacity-30 font-bold">Actions Admin</div>
                                            <div className="flex flex-col gap-2">
                                                {(selectedTrip.status === 'STARTED' || selectedTrip.status === 'COMPLETED_MISMATCH') && (
                                                    <button
                                                        onClick={() => handleCancel(selectedTrip)}
                                                        disabled={isCancelling}
                                                        className="btn btn-error btn-sm font-bold"
                                                    >
                                                        {isCancelling ? <span className="loading loading-spinner loading-xs"></span> : '⛔'}
                                                        Annuler ce trajet
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedTrip(null)}
                                                    className="btn btn-ghost btn-sm text-xs opacity-50 hover:opacity-100"
                                                >
                                                    Fermer le panneau
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-base-200/50 rounded-3xl border-4 border-dashed border-base-300 opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                    <p className="text-sm font-bold uppercase tracking-widest text-center px-8">Cliquez sur un trajet pour voir les détails</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TripManagement;
