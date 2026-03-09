import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userSummary, setUserSummary] = useState<any>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await userService.getAllUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleViewUser = async (user: UserProfile) => {
        setSelectedUser(user);
        setIsSummaryLoading(true);
        setUserSummary(null);
        try {
            const summary = await userService.getUserSummary(user.keycloakId);
            setUserSummary(summary);
        } catch (error) {
            console.error("Failed to load user summary", error);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const handleSuspend = async (user: UserProfile) => {
        const reason = window.prompt("Raison de la suspension (optionnel) :", "Activités suspectes");
        if (reason === null) return;
        try {
            await userService.suspendUser(user.keycloakId, reason);
            loadUsers();
            if (selectedUser?.keycloakId === user.keycloakId) {
                handleViewUser({ ...user, active: false, suspensionReason: reason });
            }
        } catch (error) {
            alert("Erreur lors de la suspension.");
        }
    };

    const handleReactivate = async (user: UserProfile) => {
        if (!window.confirm(`Réactiver le compte de ${user.firstName || 'cet utilisateur'} ?`)) return;
        try {
            await userService.reactivateUser(user.keycloakId);
            loadUsers();
            if (selectedUser?.keycloakId === user.keycloakId) {
                handleViewUser({ ...user, active: true, suspensionReason: undefined });
            }
        } catch (error) {
            alert("Erreur lors de la réactivation.");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.keycloakId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <Navbar />

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Gestion des <span className="text-primary">Utilisateurs</span></h1>
                            <p className="opacity-60 text-sm mt-1 uppercase font-bold tracking-widest">Surveillance et modération des profils MaaS</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="join shadow-lg">
                                <input
                                    className="input input-sm join-item bg-base-200 border-none focus:ring-0 w-48 md:w-64"
                                    placeholder="Rechercher (Email, ID, Nom)..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-sm join-item btn-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </button>
                            </div>
                            <div className="badge badge-lg badge-primary font-bold shadow-lg p-4">{users.length} Inscrits</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: User List */}
                        <div className="lg:col-span-2">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                </div>
                            ) : (
                                <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr className="bg-primary/5 text-primary font-black uppercase text-xs tracking-wider">
                                                    <th className="p-6">Utilisateur</th>
                                                    <th>Statut</th>
                                                    <th>Date Inscription</th>
                                                    <th className="text-right p-6">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.keycloakId} className={`hover:bg-primary/5 transition-colors group ${selectedUser?.keycloakId === user.keycloakId ? 'bg-primary/10' : ''}`}>
                                                        <td className="p-6 cursor-pointer" onClick={() => handleViewUser(user)}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="avatar placeholder">
                                                                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                                        <span className="text-xs uppercase font-bold">{(user.firstName?.[0] || user.email[0])}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-base">{user.firstName} {user.lastName}</span>
                                                                    <span className="text-xs opacity-50 font-mono">{user.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {user.active ? (
                                                                <div className="badge badge-success badge-sm font-bold text-[10px] p-2">ACTIF</div>
                                                            ) : (
                                                                <div className="badge badge-error badge-sm font-bold text-[10px] p-2">SUSPENDU</div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className="text-xs font-medium opacity-60">
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="text-right p-6">
                                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleViewUser(user)} className="btn btn-square btn-ghost btn-xs text-primary">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                </button>
                                                                {user.active ? (
                                                                    <button onClick={() => handleSuspend(user)} className="btn btn-square btn-ghost btn-xs text-error" title="Suspendre">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => handleReactivate(user)} className="btn btn-square btn-ghost btn-xs text-success" title="Réactiver">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredUsers.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="p-20 text-center opacity-40 italic">Aucun utilisateur trouvé.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: User Detail/Summary */}
                        <div className="lg:col-span-1">
                            {selectedUser ? (
                                <div className="card bg-base-200 shadow-xl border border-primary/20 sticky top-8 animate-in fade-in slide-in-from-right-4">
                                    <div className="card-body p-6">
                                        <div className="flex flex-col items-center text-center mb-6">
                                            <div className="avatar placeholder mb-4 scale-125">
                                                <div className="bg-primary text-primary-content rounded-full w-16">
                                                    <span className="text-xl uppercase font-black">{(selectedUser.firstName?.[0] || selectedUser.email[0])}</span>
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-black">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                            <p className="text-xs font-mono opacity-50 mb-4">{selectedUser.keycloakId}</p>
                                            {!selectedUser.active && (
                                                <div className="alert alert-error text-xs font-bold py-2 mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span>Compte Suspendu : {selectedUser.suspensionReason}</span>
                                                </div>
                                            )}
                                            <div className="flex gap-2 w-full">
                                                {selectedUser.active ? (
                                                    <button onClick={() => handleSuspend(selectedUser)} className="btn btn-error btn-sm flex-grow font-bold">Suspendre</button>
                                                ) : (
                                                    <button onClick={() => handleReactivate(selectedUser)} className="btn btn-success btn-sm flex-grow font-bold text-white">Réactiver</button>
                                                )}
                                                <button className="btn btn-outline btn-sm font-bold">Message</button>
                                            </div>
                                        </div>

                                        <div className="divider text-[10px] uppercase font-bold opacity-30">Synthèse Mobilité</div>

                                        {isSummaryLoading ? (
                                            <div className="flex justify-center p-8"><span className="loading loading-dots loading-md text-primary"></span></div>
                                        ) : userSummary ? (
                                            <div className="space-y-4">
                                                <div className="bg-base-300 rounded-xl p-4 flex justify-between items-center shadow-inner">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-black opacity-40 leading-none mb-1">Pass Actif</p>
                                                            <p className="font-bold text-sm leading-none">{userSummary.passType || 'Aucun pass'}</p>
                                                        </div>
                                                    </div>
                                                    {userSummary.hasActivePass && <div className="badge badge-success badge-xs"></div>}
                                                </div>

                                                <div>
                                                    <p className="text-[10px] uppercase font-black opacity-40 mb-2 px-1">Abonnements ({userSummary.activeSubscriptions?.length || 0})</p>
                                                    <div className="flex flex-col gap-2">
                                                        {userSummary.activeSubscriptions?.map((sub: any, idx: number) => (
                                                            <div key={idx} className="bg-base-300 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-bold border-l-4 border-primary">
                                                                <span>{sub.offerName}</span>
                                                                <span className="badge badge-sm badge-outline opacity-60">-{sub.discountPercentage}%</span>
                                                            </div>
                                                        ))}
                                                        {(!userSummary.activeSubscriptions || userSummary.activeSubscriptions.length === 0) && (
                                                            <p className="text-xs opacity-30 italic px-1">Aucun abonnement actif.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <button
                                                        onClick={() => navigate(`/admin/trips?userId=${selectedUser.keycloakId}`)}
                                                        className="btn btn-ghost btn-sm w-full text-xs font-bold text-primary hover:bg-primary/10"
                                                    >
                                                        Consulter l'historique des voyages →
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-xs opacity-40 italic py-8">Impossible de charger le résumé.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-base-200/50 rounded-3xl border-4 border-dashed border-base-300 opacity-60 animate-pulse">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <p className="text-sm font-bold uppercase tracking-widest text-center px-8">Sélectionnez un utilisateur pour voir ses détails</p>
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

export default UserManagement;
