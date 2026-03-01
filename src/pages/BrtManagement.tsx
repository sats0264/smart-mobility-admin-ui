import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { TransportLine, Zone, DiscountRule } from '../services/pricingService';

const BrtManagement: React.FC = () => {
    const navigate = useNavigate();
    const [lines, setLines] = useState<TransportLine[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [rules, setRules] = useState<DiscountRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create Line Form
    const [newLineName, setNewLineName] = useState('');

    // Create Zone Form
    const [newZoneNumber, setNewZoneNumber] = useState<number | ''>('');

    // Create Discount Rule Form
    const [newRuleType, setNewRuleType] = useState('OFFPEAK');
    const [newPercentage, setNewPercentage] = useState<number | ''>('');
    const [newCondition, setNewCondition] = useState('BRT');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedLines, fetchedZones, fetchedRules] = await Promise.all([
                pricingService.getTransportLines(),
                pricingService.getZones(),
                pricingService.getDiscountRules()
            ]);
            setLines(fetchedLines.filter(l => l.transportType === 'BRT'));
            setZones(fetchedZones);
            setRules(fetchedRules);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateLine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLineName.trim()) return;

        try {
            await pricingService.createTransportLine({
                name: newLineName,
                transportType: 'BRT'
            });
            setNewLineName('');
            loadData(); // Refresh list
        } catch (error) {
            alert("Erreur lors de la création de la ligne BRT. Vérifiez si le backend est accessible.");
        }
    };

    const handleCreateZone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newZoneNumber === '') return;

        try {
            await pricingService.createZone({
                zoneNumber: Number(newZoneNumber)
            });
            setNewZoneNumber('');
            loadData(); // Refresh list
        } catch (error) {
            alert("Erreur lors de la création de la zone tarifaire.");
        }
    };

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPercentage === '') return;

        try {
            await pricingService.createDiscountRule({
                ruleType: newRuleType,
                percentage: Number(newPercentage),
                priority: 3, // Default priority
                condition: newCondition,
                active: true
            });
            setNewPercentage('');
            loadData();
        } catch (error) {
            alert("Erreur lors de la création de la règle.");
        }
    };

    const handleDeleteRule = async (id: number | undefined) => {
        if (!id) return;
        if (confirm("Voulez-vous vraiment supprimer cette réduction ?")) {
            try {
                await pricingService.deleteDiscountRule(id);
                loadData();
            } catch (error) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <header>
                <Navbar />
            </header>

            <main className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-circle btn-ghost btn-sm"
                            title="Retour"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-4xl font-bold text-base-content">Gestion <span className="text-secondary text-5xl">BRT</span> Dakar</h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <span className="loading loading-spinner loading-lg text-secondary"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Lignes BRT */}
                            <div className="card bg-base-200 shadow-sm border border-secondary/20">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-secondary flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Corridors BRT
                                    </h2>

                                    <ul className="list-none p-0 flex flex-col gap-3 max-h-64 overflow-y-auto mb-6 pr-2">
                                        {lines.map((line) => (
                                            <li key={line.id} className="bg-base-100 rounded-lg shadow-sm border border-base-300 overflow-hidden">
                                                {line.stations && line.stations.length > 0 ? (
                                                    <details className="group">
                                                        <summary className="p-4 flex justify-between items-center cursor-pointer list-none hover:bg-base-200/50 transition-colors [&::-webkit-details-marker]:hidden">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm md:text-base">{line.name}</span>
                                                                <span className="badge badge-xs badge-neutral hidden sm:inline-flex">{line.stations.length} arrêts</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="badge badge-secondary badge-outline text-[10px]">ID: {line.id}</div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                            </div>
                                                        </summary>
                                                        <div className="p-4 pt-0 border-t border-base-200 bg-base-100/50">
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {line.stations.map((station, idx) => (
                                                                    <span key={idx} className="badge badge-sm badge-ghost border-base-300">{station}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </details>
                                                ) : (
                                                    <div className="p-4 flex justify-between items-center">
                                                        <span className="font-bold text-sm md:text-base">{line.name}</span>
                                                        <div className="badge badge-secondary badge-outline text-[10px]">ID: {line.id}</div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                        {lines.length === 0 && (
                                            <div className="text-center opacity-50 py-4 italic">Aucun corridor BRT disponible.</div>
                                        )}
                                    </ul>

                                    <div className="divider text-sm text-base-content/60">Ajouter un corridor</div>

                                    <form onSubmit={handleCreateLine} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nom du corridor (ex: Petersen - Guédiawaye)"
                                            className="input input-bordered w-full focus:input-secondary"
                                            value={newLineName}
                                            onChange={(e) => setNewLineName(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn btn-secondary">Ajouter</button>
                                    </form>
                                </div>
                            </div>

                            {/* Zones Tarifaires */}
                            <div className="card bg-base-200 shadow-sm border border-accent/20">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-accent flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Zones Tarifaires
                                    </h2>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-64 overflow-y-auto pr-2">
                                        {zones.map((zone) => {
                                            let zoneName = "Zone Inconnue";
                                            let stations = "";
                                            if (zone.zoneNumber === 1) { zoneName = "Petersen"; stations = "9 stations"; }
                                            if (zone.zoneNumber === 2) { zoneName = "Grand Médine"; stations = "6 stations"; }
                                            if (zone.zoneNumber === 3) { zoneName = "Guédiawaye"; stations = "8 stations"; }

                                            return (
                                                <div key={zone.id} className="bg-accent/10 border border-accent/30 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                                    <div className="absolute top-0 w-full h-1 bg-accent/40 group-hover:bg-accent transition-colors"></div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-accent/80 mb-1">Zone {zone.zoneNumber}</span>
                                                    <span className="text-xl font-black text-accent leading-tight mb-1">{zoneName}</span>
                                                    {stations && <span className="badge badge-accent badge-outline text-[10px] mt-1">{stations}</span>}
                                                </div>
                                            );
                                        })}
                                        {zones.length === 0 && (
                                            <div className="col-span-full text-center opacity-50 italic py-4">Aucune zone tarifaire définie.</div>
                                        )}
                                    </div>
                                    <div className="divider text-sm text-base-content/60 mt-auto">Ajouter une zone</div>

                                    <form onSubmit={handleCreateZone} className="flex gap-2">
                                        <div className="join w-full">
                                            <span className="join-item btn pointer-events-none bg-base-300">Zone N°</span>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Ex: 4"
                                                className="input input-bordered join-item flex-1 focus:input-accent"
                                                value={newZoneNumber}
                                                onChange={(e) => setNewZoneNumber(e.target.value ? Number(e.target.value) : '')}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-accent w-28">Ajouter</button>
                                    </form>
                                </div>
                            </div>

                            {/* Réductions et Tarifications Spéciales */}
                            <div className="card bg-base-200 shadow-sm border border-info/20 md:col-span-2">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-info flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Réductions & Règles Tarifaires
                                    </h2>

                                    <div className="overflow-x-auto w-full mb-6">
                                        <table className="table w-full bg-base-100 rounded-lg shadow-sm">
                                            <thead className="bg-base-300 text-base-content text-sm">
                                                <tr>
                                                    <th>Type de Règle</th>
                                                    <th>Condition</th>
                                                    <th>Réduction (%)</th>
                                                    <th>Statut</th>
                                                    <th className="text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rules.map((rule) => (
                                                    <tr key={rule.id} className="hover">
                                                        <td>
                                                            <div className="font-bold">{rule.ruleType}</div>
                                                            <div className="text-xs opacity-50">Priorité: {rule.priority}</div>
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-ghost badge-sm">{rule.condition || 'ALL'}</span>
                                                        </td>
                                                        <td>
                                                            <span className="text-success font-bold text-lg">-{rule.percentage}%</span>
                                                        </td>
                                                        <td>
                                                            {rule.active ? (
                                                                <span className="badge badge-success badge-sm">Actif</span>
                                                            ) : (
                                                                <span className="badge badge-error badge-sm">Inactif</span>
                                                            )}
                                                        </td>
                                                        <td className="text-right">
                                                            <button
                                                                onClick={() => handleDeleteRule(rule.id)}
                                                                className="btn btn-ghost btn-xs text-error"
                                                                title="Supprimer la règle"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {rules.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="text-center opacity-50 py-4 italic">Aucune règle de réduction active.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="divider text-sm text-base-content/60">Ajouter une nouvelle règle</div>

                                    <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Type</span></label>
                                            <select className="select select-bordered focus:select-info" value={newRuleType} onChange={e => setNewRuleType(e.target.value)}>
                                                <option value="OFFPEAK">Heure Creuse (OFFPEAK)</option>
                                                <option value="LOYALTY">Fidélité (LOYALTY)</option>
                                                <option value="STUDENT">Étudiant (STUDENT)</option>
                                            </select>
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Condition / Réseau</span></label>
                                            <select className="select select-bordered focus:select-info" value={newCondition} onChange={e => setNewCondition(e.target.value)}>
                                                <option value="ALL">Tous les réseaux (ALL)</option>
                                                <option value="BRT">Réseau BRT</option>
                                                <option value="BUS">Réseau Bus</option>
                                            </select>
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Réduction (%)</span></label>
                                            <div className="join">
                                                <input
                                                    type="number"
                                                    placeholder="Ex: 20"
                                                    min="0"
                                                    max="100"
                                                    className="input input-bordered join-item w-full focus:input-info"
                                                    value={newPercentage}
                                                    onChange={e => setNewPercentage(e.target.value ? Number(e.target.value) : '')}
                                                    required
                                                />
                                                <span className="join-item btn pointer-events-none bg-base-300">%</span>
                                            </div>
                                        </div>
                                        <div className="form-control mt-4 md:mt-0">
                                            <button type="submit" className="btn btn-info w-full">Ajouter Règle</button>
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

export default BrtManagement;
