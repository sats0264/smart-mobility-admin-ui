import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { catalogService } from '../services/catalogService';
import type { SubscriptionOffer, PassOffer } from '../services/catalogService';

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
                                <div className="card bg-base-200 shadow-sm">
                                    <div className="card-body">
                                        <h2 className="card-title text-2xl mb-4 text-primary">
                                            {activeTab === 'SUBSCRIPTIONS' ? 'Offres d\'Abonnement' : 'Offres de Pass'}
                                        </h2>
                                        <div className="overflow-x-auto">
                                            <table className="table w-full">
                                                <thead>
                                                    <tr>
                                                        <th>Nom</th>
                                                        <th>Prix</th>
                                                        <th>Détails</th>
                                                        <th>Validité</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeTab === 'SUBSCRIPTIONS' ? (
                                                        subOffers.map(offer => (
                                                            <tr key={offer.id}>
                                                                <td className="font-bold">{offer.name}</td>
                                                                <td className="text-success font-mono">{offer.price} FCFA</td>
                                                                <td>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="badge badge-sm badge-ghost">{offer.subscriptionType}</span>
                                                                        <span className="text-xs">Remise: {offer.discountPercentage}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-xs">{offer.validityDays} jours</td>
                                                                <td className="flex gap-2">
                                                                    <button onClick={() => handleEditSub(offer)} className="btn btn-ghost btn-xs text-primary">Modifier</button>
                                                                    <button onClick={() => offer.id && handleDelete(offer.id)} className="btn btn-ghost btn-xs text-error">Supprimer</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        passOffers.map(offer => (
                                                            <tr key={offer.id}>
                                                                <td className="font-bold">{offer.name}</td>
                                                                <td className="text-success font-mono">{offer.price} FCFA</td>
                                                                <td>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="badge badge-sm badge-ghost">{offer.passType}</span>
                                                                        <span className="text-xs">Cap: {offer.dailyCapAmount} FCFA</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-xs">{offer.validityDays} jours</td>
                                                                <td className="flex gap-2">
                                                                    <button onClick={() => handleEditPass(offer)} className="btn btn-ghost btn-xs text-primary">Modifier</button>
                                                                    <button onClick={() => offer.id && handleDelete(offer.id)} className="btn btn-ghost btn-xs text-error">Supprimer</button>
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
                                                        <option value="MONTHLY">MENSUEL</option>
                                                        <option value="WEEKLY">HEBDOMADAIRE</option>
                                                        <option value="ANNUAL">ANNUEL</option>
                                                    </select>
                                                </div>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Remise (%)</span></label>
                                                    <input type="number" className="input input-bordered" value={discount} onChange={e => setDiscount(e.target.value ? Number(e.target.value) : '')} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="form-control">
                                                    <label className="label"><span className="label-text">Type de Pass</span></label>
                                                    <select className="select select-bordered" value={passType} onChange={e => setPassType(e.target.value)}>
                                                        <option value="STANDARD">STANDARD</option>
                                                        <option value="PREMIUM">PREMIUM</option>
                                                        <option value="STUDENT">ÉTUDIANT</option>
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
