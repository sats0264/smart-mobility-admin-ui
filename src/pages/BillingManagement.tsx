import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { billingService, type BillingStats, type Transaction } from '../services/billingService';

const BillingManagement: React.FC = () => {
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedStats, fetchedTransactions] = await Promise.all([
                billingService.getStats(),
                billingService.getTransactions()
            ]);
            setStats(fetchedStats);
            setTransactions(fetchedTransactions);
        } catch (error) {
            console.error("Failed to load billing data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <Navbar />

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Gestion <span className="text-primary">Financière</span></h1>
                            <p className="opacity-60 text-sm mt-1 uppercase font-bold tracking-widest">Transactions, Revenus et Tableaux de bord</p>
                        </div>
                        <button onClick={loadData} className="btn btn-outline btn-primary shadow-sm" disabled={isLoading}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Actualiser
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <span className="loading loading-spinner text-primary loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            {/* KPI Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="stat bg-base-200 border border-primary/20 rounded-2xl shadow-lg hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="stat-figure text-primary opacity-20">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-12 h-12 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    </div>
                                    <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Revenus Totaux</div>
                                    <div className="stat-value text-primary text-3xl font-black">{stats ? formatCurrency(stats.totalRevenue) : '0'}</div>
                                    <div className="stat-desc font-semibold mt-1 opacity-50">&nbsp;</div>
                                </div>
                                <div className="stat bg-base-200 border border-secondary/20 rounded-2xl shadow-lg hover:border-secondary transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="stat-figure text-secondary opacity-20">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-12 h-12 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Comptes Utilisateurs</div>
                                    <div className="stat-value text-secondary text-3xl font-black">{stats?.totalAccounts || 0}</div>
                                    <div className="stat-desc font-semibold mt-1 opacity-50">Solde global: {stats ? formatCurrency(stats.totalBalance) : '0'}</div>
                                </div>
                                <div className="stat bg-base-200 border border-accent/20 rounded-2xl shadow-lg hover:border-accent transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="stat-figure text-accent opacity-20">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-12 h-12 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                    </div>
                                    <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Transactions</div>
                                    <div className="stat-value text-accent text-3xl font-black">{stats?.totalTransactions || 0}</div>
                                    <div className="stat-desc font-semibold text-success mt-1">{stats?.successfulTransactions || 0} réussies</div>
                                </div>
                                <div className="stat bg-base-200 border border-error/20 rounded-2xl shadow-lg hover:border-error transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="stat-figure text-error opacity-20">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-12 h-12 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Taux de Succès</div>
                                    <div className="stat-value text-error text-3xl font-black">
                                        {stats?.totalTransactions ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100) : 0}%
                                    </div>
                                    <div className="stat-desc font-semibold text-error mt-1">{stats ? (stats.totalTransactions - stats.successfulTransactions) : 0} échecs</div>
                                </div>
                            </div>

                            {/* Transactions Table */}
                            <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="p-6 border-b border-base-300 flex justify-between items-center bg-base-300/30">
                                        <h2 className="card-title font-bold">Historique Récent</h2>
                                        <div className="badge badge-primary font-bold">{transactions.length} enregistrements</div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="bg-primary/5 text-primary text-xs uppercase tracking-widest font-black">
                                                    <th className="p-4">Date & Heure</th>
                                                    <th>Description</th>
                                                    <th>Type</th>
                                                    <th>Statut</th>
                                                    <th className="text-right p-4">Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.slice(0, 50).map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-primary/5 transition-colors border-b border-base-300/50 last:border-0">
                                                        <td className="p-4 whitespace-nowrap opacity-70 text-xs font-mono font-bold">
                                                            {formatDate(tx.createdAt)}
                                                        </td>
                                                        <td className="font-semibold text-sm max-w-xs truncate" title={tx.description}>
                                                            {tx.description || 'Transaction inconnue'}
                                                            {tx.tripId && <div className="text-[10px] opacity-40 uppercase font-mono mt-1">Ref: {tx.tripId}</div>}
                                                        </td>
                                                        <td>
                                                            {tx.type === 'CREDIT' ? (
                                                                <span className="badge badge-success badge-sm badge-outline font-bold text-[10px] w-16 text-center">RECHARGE</span>
                                                            ) : (
                                                                <span className="badge badge-error badge-sm badge-outline font-bold text-[10px] w-16 text-center">DÉBIT</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {tx.status === 'SUCCESS' && <span className="text-success text-xs font-black uppercase"><span className="inline-block w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></span>Réussi</span>}
                                                            {tx.status === 'FAILED' && <span className="text-error text-xs font-black uppercase"><span className="inline-block w-2 h-2 rounded-full bg-error mr-2"></span>Échec</span>}
                                                            {tx.status === 'PENDING' && <span className="text-warning text-xs font-black uppercase"><span className="inline-block w-2 h-2 rounded-full bg-warning mr-2 animate-pulse"></span>En cours</span>}
                                                        </td>
                                                        <td className={`text-right font-black p-4 whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-success' : 'text-error'}`}>
                                                            {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {transactions.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center opacity-40 font-semibold italic">Aucune transaction trouvée.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {transactions.length > 50 && (
                                        <div className="p-4 border-t border-base-300 text-center bg-base-300/30">
                                            <span className="text-xs font-bold opacity-40">Affichage limité aux 50 dernières transactions.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BillingManagement;
