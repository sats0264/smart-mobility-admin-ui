import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { notificationService } from '../services/notificationService';
import type { Notification as AppNotification, BroadcastRequest } from '../services/notificationService';

// ─── Config ──────────────────────────────────────────────────────────────────

type BroadcastType = 'ANNOUNCEMENT' | 'MAINTENANCE' | 'NETWORK_ALERT';

const broadcastTypeConfig: Record<BroadcastType, { label: string; icon: string; color: string; badgeCls: string; bg: string }> = {
    ANNOUNCEMENT: { label: 'Annonce', icon: '📢', color: 'text-info', badgeCls: 'badge-info', bg: 'bg-info/10 border-info/30' },
    MAINTENANCE: { label: 'Maintenance', icon: '🔧', color: 'text-warning', badgeCls: 'badge-warning', bg: 'bg-warning/10 border-warning/30' },
    NETWORK_ALERT: { label: 'Alerte Réseau', icon: '⚠️', color: 'text-error', badgeCls: 'badge-error', bg: 'bg-error/10 border-error/30' },
};

const channelIcon: Record<string, string> = {
    EMAIL: '📧', SMS: '📱', PUSH: '🔔', IN_APP: '📲',
};

const statusCls: Record<string, string> = {
    SENT: 'text-success',
    FAILED: 'text-error',
    PENDING: 'text-warning',
};

// ─── Component ───────────────────────────────────────────────────────────────

const NotificationManagement: React.FC = () => {
    const [broadcasts, setBroadcasts] = useState<AppNotification[]>([]);
    const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'all'>('compose');
    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);

    // Form state
    const [form, setForm] = useState<BroadcastRequest>({
        title: '',
        message: '',
        type: 'ANNOUNCEMENT',
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedBroadcasts, fetchedAll] = await Promise.all([
                notificationService.getBroadcasts(),
                notificationService.getAllNotifications(),
            ]);
            setBroadcasts(fetchedBroadcasts);
            setAllNotifications(fetchedAll);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSend = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            alert('Veuillez remplir le titre et le message.');
            return;
        }
        setIsSending(true);
        setSentSuccess(false);
        try {
            await notificationService.sendBroadcast(form);
            setSentSuccess(true);
            setForm({ title: '', message: '', type: 'ANNOUNCEMENT' });
            await loadData();
            setActiveTab('history');
        } catch {
            alert('Erreur lors de l\'envoi de la notification.');
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (s: string) =>
        new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const selectedTypeCfg = broadcastTypeConfig[form.type];

    // Stats
    const sentCount = broadcasts.filter(n => n.status === 'SENT').length;

    return (
        <div className="min-h-screen flex flex-col bg-base-100">
            <Navbar />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                Gestion des <span className="text-primary">Notifications</span>
                            </h1>
                            <p className="opacity-60 text-sm mt-1 uppercase font-bold tracking-widest">
                                Communiquer avec les voyageurs
                            </p>
                        </div>
                        <button onClick={loadData} disabled={isLoading} className="btn btn-outline btn-primary btn-sm shadow-sm self-start md:self-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualiser
                        </button>
                    </div>

                    {/* KPI Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="stat bg-base-200 rounded-2xl shadow border border-base-300 p-4">
                            <div className="stat-title text-xs uppercase font-black opacity-50">Broadcasts envoyés</div>
                            <div className="stat-value text-3xl font-black text-primary">{sentCount}</div>
                        </div>
                        {(['ANNOUNCEMENT', 'MAINTENANCE', 'NETWORK_ALERT'] as BroadcastType[]).map(t => {
                            const cfg = broadcastTypeConfig[t];
                            const count = broadcasts.filter(n => n.type === t).length;
                            return (
                                <div key={t} className={`stat rounded-2xl shadow border p-4 ${cfg.bg}`}>
                                    <div className={`stat-title text-xs uppercase font-black opacity-70 ${cfg.color}`}>{cfg.icon} {cfg.label}</div>
                                    <div className={`stat-value text-3xl font-black ${cfg.color}`}>{count}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tabs */}
                    <div className="tabs tabs-boxed bg-base-200 p-1 rounded-2xl mb-6 w-fit">
                        {([
                            { key: 'compose', label: '✍️ Composer' },
                            { key: 'history', label: '📡 Broadcasts' },
                            { key: 'all', label: '📋 Toutes' },
                        ] as { key: 'compose' | 'history' | 'all'; label: string }[]).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`tab tab-lg font-bold transition-all rounded-xl ${activeTab === tab.key ? 'tab-active' : 'opacity-50 hover:opacity-80'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: Composer ── */}
                    {activeTab === 'compose' && (
                        <div className="max-w-2xl">
                            {sentSuccess && (
                                <div className="alert alert-success mb-6 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-bold">Notification envoyée avec succès !</span>
                                </div>
                            )}

                            <div className="card bg-base-200 shadow-xl border border-base-300">
                                <div className="card-body gap-6">
                                    <h2 className="card-title font-black">Nouvelle Notification Broadcast</h2>

                                    {/* Type Selector */}
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 mb-3 block">Type de notification</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['ANNOUNCEMENT', 'MAINTENANCE', 'NETWORK_ALERT'] as BroadcastType[]).map(t => {
                                                const cfg = broadcastTypeConfig[t];
                                                const isSelected = form.type === t;
                                                return (
                                                    <button
                                                        key={t}
                                                        onClick={() => setForm(f => ({ ...f, type: t }))}
                                                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${isSelected
                                                                ? `${cfg.bg} border-current ${cfg.color} shadow-lg scale-105`
                                                                : 'bg-base-300 border-transparent opacity-50 hover:opacity-80 hover:border-base-content/20'
                                                            }`}
                                                    >
                                                        <div className="text-2xl mb-1">{cfg.icon}</div>
                                                        <div className={`text-xs font-black uppercase tracking-widest ${isSelected ? cfg.color : ''}`}>{cfg.label}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Preview Banner */}
                                    <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${selectedTypeCfg.bg}`}>
                                        <span className="text-3xl">{selectedTypeCfg.icon}</span>
                                        <div>
                                            <div className={`text-xs font-black uppercase tracking-widest ${selectedTypeCfg.color} mb-0.5`}>{selectedTypeCfg.label}</div>
                                            <div className="font-bold text-sm opacity-70">{form.title || 'Titre de la notification…'}</div>
                                            <div className="text-xs opacity-50 mt-0.5">{form.message || 'Votre message apparaîtra ici…'}</div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="form-control">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 block">Titre *</label>
                                        <input
                                            type="text"
                                            className="input bg-base-300 border-none focus:ring-2 focus:ring-primary rounded-xl w-full"
                                            placeholder="Ex: Perturbation Ligne B12…"
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            maxLength={120}
                                        />
                                        <div className="text-right text-[10px] opacity-30 mt-1">{form.title.length}/120</div>
                                    </div>

                                    {/* Message */}
                                    <div className="form-control">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 block">Message *</label>
                                        <textarea
                                            className="textarea bg-base-300 border-none focus:ring-2 focus:ring-primary rounded-xl w-full min-h-[120px]"
                                            placeholder="Décrivez l'annonce, la maintenance planifiée ou l'alerte réseau en détail…"
                                            value={form.message}
                                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            maxLength={500}
                                        />
                                        <div className="text-right text-[10px] opacity-30 mt-1">{form.message.length}/500</div>
                                    </div>

                                    {/* Audience info */}
                                    <div className="flex items-center gap-2 bg-base-300 rounded-xl px-4 py-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <span className="text-xs font-bold opacity-50">Cette notification sera diffusée à <strong>tous les voyageurs</strong> de l'application.</span>
                                    </div>

                                    {/* Send Button */}
                                    <button
                                        onClick={handleSend}
                                        disabled={isSending || !form.title.trim() || !form.message.trim()}
                                        className={`btn btn-lg font-black rounded-xl w-full ${form.type === 'ANNOUNCEMENT' ? 'btn-info' :
                                                form.type === 'MAINTENANCE' ? 'btn-warning' :
                                                    'btn-error'
                                            }`}
                                    >
                                        {isSending ? (
                                            <><span className="loading loading-spinner loading-sm"></span> Envoi en cours…</>
                                        ) : (
                                            <>{selectedTypeCfg.icon} Envoyer la {selectedTypeCfg.label}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: Broadcast History ── */}
                    {activeTab === 'history' && (
                        <div>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {broadcasts.length === 0 ? (
                                        <div className="text-center py-20 opacity-30 italic">Aucun broadcast envoyé pour l'instant.</div>
                                    ) : broadcasts.map(n => {
                                        const type = n.type as BroadcastType;
                                        const cfg = broadcastTypeConfig[type] ?? broadcastTypeConfig.ANNOUNCEMENT;
                                        // Extract title and body from message format "[Title] Body"
                                        const match = n.message.match(/^\[(.+?)\]\s*(.*)/s);
                                        const title = match ? match[1] : n.type;
                                        const body = match ? match[2] : n.message;

                                        return (
                                            <div key={n.id} className={`card border shadow-md ${cfg.bg}`}>
                                                <div className="card-body p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <span className="text-2xl shrink-0">{cfg.icon}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    <span className={`badge ${cfg.badgeCls} badge-sm font-bold text-[10px]`}>{cfg.label}</span>
                                                                    <span className="text-xs opacity-40 font-mono">{formatDate(n.createdAt)}</span>
                                                                </div>
                                                                <div className="font-black text-sm">{title}</div>
                                                                <div className="text-sm opacity-70 mt-1 leading-relaxed">{body}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`text-xs font-black uppercase tracking-widest shrink-0 ${statusCls[n.status] || ''}`}>
                                                            {n.status === 'SENT' ? '✓ Envoyé' : n.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: All Notifications ── */}
                    {activeTab === 'all' && (
                        <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-base-300 bg-base-300/20">
                                <h2 className="font-black">Toutes les Notifications</h2>
                                <div className="badge badge-primary font-bold">{allNotifications.length}</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table table-sm w-full">
                                    <thead>
                                        <tr className="bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-black">
                                            <th className="p-4">Utilisateur</th>
                                            <th>Type</th>
                                            <th>Canal</th>
                                            <th>Message</th>
                                            <th>Statut</th>
                                            <th className="text-right p-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allNotifications.slice(0, 100).map(n => (
                                            <tr key={n.id} className="border-b border-base-300/30 hover:bg-primary/5 transition-colors last:border-0">
                                                <td className="p-4">
                                                    {n.userId === 'BROADCAST' ? (
                                                        <span className="badge badge-primary badge-sm font-bold">BROADCAST</span>
                                                    ) : (
                                                        <span className="font-mono text-xs opacity-60 truncate max-w-[100px] block">{n.userId}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="text-xs font-bold opacity-60">
                                                        {n.type === 'ANNOUNCEMENT' ? '📢' : n.type === 'MAINTENANCE' ? '🔧' : n.type === 'NETWORK_ALERT' ? '⚠️' : '🔔'} {n.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-xs">{channelIcon[n.channel] || '📨'} {n.channel}</span>
                                                </td>
                                                <td className="max-w-xs truncate text-xs opacity-70" title={n.message}>{n.message}</td>
                                                <td>
                                                    <span className={`text-xs font-black uppercase ${statusCls[n.status] || ''}`}>
                                                        {n.status === 'SENT' ? '✓' : n.status === 'FAILED' ? '✗' : '⟳'} {n.status}
                                                    </span>
                                                </td>
                                                <td className="text-right text-[10px] font-mono opacity-40 p-4 whitespace-nowrap">{formatDate(n.createdAt)}</td>
                                            </tr>
                                        ))}
                                        {allNotifications.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center opacity-30 italic">Aucune notification trouvée.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotificationManagement;
