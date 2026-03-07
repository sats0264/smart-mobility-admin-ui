import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { catalogService } from '../services/catalogService';
import type { SubscriptionOffer, PassOffer } from '../services/catalogService';

const STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  .table-row-hover:hover {
    background-color: hsl(var(--b3));
    transition: all 0.2s ease;
    transform: scale(1.005);
  }
  .glass-card {
    background: rgba(var(--b2), 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--bc), 0.1);
  }
`;

const CatalogManagement: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'PASSES'>('SUBSCRIPTIONS');
    const [subOffers, setSubOffers] = useState<SubscriptionOffer[]>([]);
    const [passOffers, setPassOffers] = useState<PassOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Common Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [validityDays, setValidityDays] = useState<number | ''>(30);
    const [active, setActive] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Subscription Specific
    const [subType, setSubType] = useState('MONTHLY');
    const [transport, setTransport] = useState('ALL');
    const [discount, setDiscount] = useState<number | ''>(0);

    // Pass Specific
    const [passType, setPassType] = useState('STANDARD');
    const [dailyCap, setDailyCap] = useState<number | ''>(0);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [subs, passes] = await Promise.all([
                catalogService.getSubscriptionOffers(),
                catalogService.getPassOffers()
            ]);
            setSubOffers(subs);
            setPassOffers(passes);
        } catch (error) {
            console.error("Failed to load catalog data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setPrice('');
        setValidityDays(30);
        setActive(true);
        setSubType('MONTHLY');
        setTransport('ALL');
        setDiscount(0);
        setPassType('STANDARD');
        setDailyCap(0);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeTab === 'SUBSCRIPTIONS') {
                const data: SubscriptionOffer = {
                    name,
                    description,
                    subscriptionType: subType,
                    applicableTransport: transport,
                    discountPercentage: Number(discount),
                    price: Number(price),
                    validityDays: Number(validityDays),
                    active
                };
                if (editingId) {
                    await catalogService.updateSubscriptionOffer(editingId, data);
                } else {
                    await catalogService.createSubscriptionOffer(data);
                }
            } else {
                const data: PassOffer = {
                    name,
                    description,
                    passType: passType,
                    dailyCapAmount: Number(dailyCap),
                    price: Number(price),
                    validityDays: Number(validityDays),
                    active
                };
                if (editingId) {
                    await catalogService.updatePassOffer(editingId, data);
                } else {
                    await catalogService.createPassOffer(data);
                }
            }
            resetForm();
            loadData();
        } catch (error) {
            alert("Erreur lors de l'enregistrement de l'offre.");
        }
    };

    const handleEditSub = (offer: SubscriptionOffer) => {
        setEditingId(offer.id || null);
        setName(offer.name);
        setDescription(offer.description);
        setPrice(offer.price);
        setValidityDays(offer.validityDays);
        setActive(offer.active);
        setSubType(offer.subscriptionType);
        setTransport(offer.applicableTransport);
        setDiscount(offer.discountPercentage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditPass = (offer: PassOffer) => {
        setEditingId(offer.id || null);
        setName(offer.name);
        setDescription(offer.description);
        setPrice(offer.price);
        setValidityDays(offer.validityDays);
        setActive(offer.active);
        setPassType(offer.passType);
        setDailyCap(offer.dailyCapAmount);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Supprimer cette offre ?")) return;
        try {
            if (activeTab === 'SUBSCRIPTIONS') {
                await catalogService.deleteSubscriptionOffer(id);
            } else {
                await catalogService.deletePassOffer(id);
            }
            loadData();
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <style>{STYLES}</style>
            <header><Navbar /></header>
            <main className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-4xl font-bold text-base-content">Gestion du <span className="text-primary">Catalogue</span></h1>
                    </div>

                    <div className="tabs tabs-boxed mb-8 bg-base-200 p-1 w-fit">
                        <button
                            className={`tab tab-lg ${activeTab === 'SUBSCRIPTIONS' ? 'tab-active' : ''}`}
                            onClick={() => { setActiveTab('SUBSCRIPTIONS'); resetForm(); }}
                        >
                            Abonnements
                        </button>
                        <button
                            className={`tab tab-lg ${activeTab === 'PASSES' ? 'tab-active' : ''}`}
                            onClick={() => { setActiveTab('PASSES'); resetForm(); }}
                        >
                            Pass Mobilité
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center h-48"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden animate-fade-in">
                                    <div className="card-body p-0">
                                        <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent">
                                            <h2 className="card-title text-2xl text-primary flex items-center gap-2">
                                                {activeTab === 'SUBSCRIPTIONS' ? (
                                                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> Offres d'Abonnement</>
                                                ) : (
                                                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Offres de Pass</>
                                                )}
                                            </h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="table w-full">
                                                <thead className="bg-base-300/50">
                                                    <tr>
                                                        <th className="rounded-none text-[10px] uppercase tracking-wider">Nom</th>
                                                        <th className="text-[10px] uppercase tracking-wider">Prix</th>
                                                        <th className="text-[10px] uppercase tracking-wider">Type / Offre</th>
                                                        <th className="text-[10px] uppercase tracking-wider">
                                                            {activeTab === 'SUBSCRIPTIONS' ? 'Transport' : 'Plafond (Cap)'}
                                                        </th>
                                                        <th className="text-[10px] uppercase tracking-wider">Validité</th>
                                                        <th className="rounded-none text-right text-[10px] uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-base-300">
                                                    {activeTab === 'SUBSCRIPTIONS' ? (
                                                        subOffers.map((offer, idx) => (
                                                            <tr key={offer.id} className="table-row-hover group" style={{ animationDelay: `${idx * 0.05}s` }}>
                                                                <td>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-sm">{offer.name}</span>
                                                                        <span className="text-[10px] text-base-content/60 italic max-w-xs truncate">{offer.description}</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-success font-bold text-sm font-mono">{offer.price.toLocaleString()} FCFA</span>
                                                                        <span className="text-[9px] uppercase tracking-wider opacity-50">Tarif Fixe</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="badge badge-primary badge-outline badge-xs font-semibold px-2 py-2">{offer.subscriptionType}</span>
                                                                        {offer.discountPercentage > 0 && (
                                                                            <span className="badge badge-accent badge-xs font-bold px-2 py-2">-{offer.discountPercentage}% Remise</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${offer.applicableTransport === 'ALL' ? 'badge-secondary' : 'badge-ghost'} badge-xs font-medium px-2 py-2`}>
                                                                        {offer.applicableTransport === 'ALL' ? 'TOUS' : offer.applicableTransport}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="flex items-center gap-1">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        <span className="text-xs font-medium">{offer.validityDays}j</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-right">
                                                                    <div className="flex justify-end gap-1">
                                                                        <button onClick={() => handleEditSub(offer)} className="btn btn-ghost btn-sm btn-square text-primary tooltip" data-tip="Modifier">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                        </button>
                                                                        <button onClick={() => offer.id && handleDelete(offer.id)} className="btn btn-ghost btn-sm btn-square text-error tooltip" data-tip="Supprimer">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        passOffers.map((offer, idx) => (
                                                            <tr key={offer.id} className="table-row-hover group" style={{ animationDelay: `${idx * 0.05}s` }}>
                                                                <td>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-sm">{offer.name}</span>
                                                                        <span className="text-[10px] text-base-content/60 italic max-w-xs truncate">{offer.description}</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-success font-bold text-sm font-mono">{offer.price.toLocaleString()} FCFA</span>
                                                                        <span className="text-[9px] uppercase tracking-wider opacity-50">Coût d'achat</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-secondary badge-outline badge-xs font-semibold px-2 py-2">{offer.passType}</span>
                                                                </td>
                                                                <td>
                                                                    <div className="flex flex-col">
                                                                        <span className="badge badge-accent badge-soft font-bold text-[10px] px-2 py-2">{offer.dailyCapAmount.toLocaleString()} FCFA</span>
                                                                        <span className="text-[9px] opacity-40 mt-0.5">PAR JOUR</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="flex items-center gap-1">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        <span className="text-xs font-medium">{offer.validityDays}j</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-right">
                                                                    <div className="flex justify-end gap-1">
                                                                        <button onClick={() => handleEditPass(offer)} className="btn btn-ghost btn-sm btn-square text-primary tooltip" data-tip="Modifier">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                        </button>
                                                                        <button onClick={() => offer.id && handleDelete(offer.id)} className="btn btn-ghost btn-sm btn-square text-error tooltip" data-tip="Supprimer">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-200 shadow-sm h-fit">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-secondary">
                                        {editingId ? 'Modifier l\'Offre' : 'Nouvelle Offre'}
                                    </h2>
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Nom de l'offre</span></label>
                                            <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Prix (FCFA)</span></label>
                                            <input type="number" className="input input-bordered w-full" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} required />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Validité (Jours)</span></label>
                                            <input type="number" className="input input-bordered w-full" value={validityDays} onChange={e => setValidityDays(e.target.value ? Number(e.target.value) : '')} required />
                                        </div>

                                        {activeTab === 'SUBSCRIPTIONS' ? (
                                            <>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Type d'abonnement</span></label>
                                                    <select className="select select-bordered" value={subType} onChange={e => setSubType(e.target.value)}>
                                                        <option value="YEARLY">ANNUEL</option>
                                                        <option value="MONTHLY">MENSUEL</option>
                                                        <option value="WEEKLY">HEBDOMADAIRE</option>
                                                        <option value="DAILY">QUOTIDIEN</option>
                                                    </select>
                                                </div>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Transport applicable</span></label>
                                                    <select className="select select-bordered" value={transport} onChange={e => setTransport(e.target.value)}>
                                                        <option value="ALL">TOUS</option>
                                                        <option value="BUS">BUS</option>
                                                        <option value="BRT">BRT</option>
                                                        <option value="TER">TER</option>
                                                    </select>
                                                </div>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Remise (%)</span></label>
                                                    <input type="number" min={0} max={100} className="input input-bordered" value={discount} onChange={e => {
                                                        const val = e.target.value ? Number(e.target.value) : '';
                                                        if (val === '') return setDiscount('');
                                                        const clamped = Math.max(0, Math.min(100, Math.round(val)));
                                                        setDiscount(clamped);
                                                    }} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Type de Pass</span></label>
                                                    <select className="select select-bordered" value={passType} onChange={e => setPassType(e.target.value)}>
                                                        <option value="STANDARD">STANDARD</option>
                                                        <option value="PREMIUM">PREMIUM</option>
                                                        <option value="ETUDIANT">ÉTUDIANT</option>
                                                    </select>
                                                </div>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Plafond Journalier (FCFA)</span></label>
                                                    <input type="number" className="input input-bordered" value={dailyCap} onChange={e => setDailyCap(e.target.value ? Number(e.target.value) : '')} />
                                                </div>
                                            </>
                                        )}

                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Description</span></label>
                                            <textarea className="textarea textarea-bordered h-20" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                                        </div>

                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input type="checkbox" className="toggle toggle-success" checked={active} onChange={e => setActive(e.target.checked)} />
                                                <span className="label-text">Activer l'offre</span>
                                            </label>
                                        </div>

                                        <div className="card-actions mt-6 flex flex-col gap-2">
                                            <button type="submit" className="btn btn-primary w-full shadow-lg">
                                                {editingId ? 'Mettre à jour' : 'Créer l\'Offre'}
                                            </button>
                                            {editingId && <button type="button" onClick={resetForm} className="btn btn-ghost w-full">Annuler</button>}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CatalogManagement;
