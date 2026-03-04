import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { DiscountRule } from '../services/pricingService';

const RulesManagement: React.FC = () => {
    const navigate = useNavigate();
    const [rules, setRules] = useState<DiscountRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [ruleType, setRuleType] = useState('OFFPEAK');
    const [percentage, setPercentage] = useState<number | ''>('');
    const [priority, setPriority] = useState<number | ''>('');
    const [condition, setCondition] = useState('ALL');
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
    const [startDay, setStartDay] = useState<number | ''>('');
    const [endDay, setEndDay] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

    const daysOfWeek = [
        { value: 1, label: 'Lundi' },
        { value: 2, label: 'Mardi' },
        { value: 3, label: 'Mercredi' },
        { value: 4, label: 'Jeudi' },
        { value: 5, label: 'Vendredi' },
        { value: 6, label: 'Samedi' },
        { value: 7, label: 'Dimanche' },
    ];

    const transportTypes = [
        { value: 'ALL', label: 'Tous' },
        { value: 'BUS', label: 'Bus' },
        { value: 'TER', label: 'TER' },
        { value: 'BRT', label: 'BRT' }
    ];

    const handleConditionChange = (value: string) => {
        const individualTypes = transportTypes.filter(t => t.value !== 'ALL').map(t => t.value);

        if (value === 'ALL') {
            setCondition(condition === 'ALL' ? '' : 'ALL');
            return;
        }

        let currentList = condition === 'ALL' ? [...individualTypes] : (condition ? condition.split(',') : []);
        const newList = currentList.includes(value)
            ? currentList.filter(v => v !== value)
            : [...currentList, value];

        if (individualTypes.every(t => newList.includes(t))) {
            setCondition('ALL');
        } else {
            setCondition(newList.join(','));
        }
    };

    const loadRules = async () => {
        setIsLoading(true);
        try {
            const fetchedRules = await pricingService.getDiscountRules();
            setRules(fetchedRules.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
        } catch (error) {
            console.error("Failed to load rules", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRules();
    }, []);

    const handleCreateOrUpdateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (percentage === '' || priority === '') return;

        const ruleData: Partial<DiscountRule> = {
            ruleType,
            percentage: Number(percentage),
            priority: Number(priority),
            condition,
            startHour: startHour || undefined,
            endHour: endHour || undefined,
            startDay: startDay !== '' ? Number(startDay) : undefined,
            endDay: endDay !== '' ? Number(endDay) : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            active: true
        };

        try {
            if (editingRuleId) {
                await pricingService.updateDiscountRule(editingRuleId, ruleData);
            } else {
                await pricingService.createDiscountRule(ruleData as DiscountRule);
            }
            resetForm();
            loadRules();
        } catch (error) {
            alert("Erreur lors de l'enregistrement de la règle.");
        }
    };

    const resetForm = () => {
        setRuleType('OFFPEAK');
        setPercentage('');
        setPriority('');
        setCondition('ALL');
        setStartHour('');
        setEndHour('');
        setStartDay('');
        setEndDay('');
        setStartDate('');
        setEndDate('');
        setEditingRuleId(null);
    };

    const handleEditRule = (rule: DiscountRule) => {
        setEditingRuleId(rule.id || null);
        setRuleType(rule.ruleType);
        setPercentage(rule.percentage);
        setPriority(rule.priority || '');
        setCondition(rule.condition || 'ALL');
        setStartHour(rule.startHour || '');
        setEndHour(rule.endHour || '');
        setStartDay(rule.startDay || '');
        setEndDay(rule.endDay || '');
        setStartDate(rule.startDate || '');
        setEndDate(rule.endDate || '');
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteRule = async (id: number) => {
        if (!window.confirm("Supprimer cette règle de réduction ?")) return;
        try {
            await pricingService.deleteDiscountRule(id);
            loadRules();
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    };

    const toggleRuleStatus = async (rule: DiscountRule) => {
        if (!rule.id) return;
        try {
            await pricingService.updateDiscountRule(rule.id, { active: !rule.active });
            loadRules();
        } catch (error) {
            alert("Erreur lors du changement de statut.");
        }
    };

    const getDayLabel = (value?: number) => {
        return daysOfWeek.find(d => d.value === value)?.label || '-';
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <Navbar />

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Règles & <span className="text-primary italic">Réductions</span></h1>
                        </div>
                        <div className="badge badge-lg badge-primary font-bold shadow-lg p-4">{rules.length} Règles Actives</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* FORM: Create/Update Rule */}
                        <div className="lg:col-span-1">
                            <div className="card bg-base-200 shadow-xl border border-primary/10 sticky top-8">
                                <div className="card-body p-6">
                                    <h2 className="card-title text-xl mb-6 text-primary flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                        {editingRuleId ? 'Modifier la règle' : 'Nouvelle règle'}
                                    </h2>

                                    <form onSubmit={handleCreateOrUpdateRule} className="space-y-4">
                                        <div className="form-control">
                                            <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Type de Règle</label>
                                            <select className="select select-bordered w-full focus:select-primary" value={ruleType} onChange={e => setRuleType(e.target.value)}>
                                                <option value="OFFPEAK">Off-Peak (Heures Creuses)</option>
                                                <option value="LOYALTY">Loyalty (Fidélité)</option>
                                                <option value="STUDENT">Student (Étudiant)</option>
                                                <option value="PROMO">Promotion Exceptionnelle</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Réduction (%)</label>
                                                <input type="number" min="0" max="100" className="input input-bordered focus:input-primary font-mono font-bold" value={percentage} onChange={e => setPercentage(e.target.value ? Number(e.target.value) : '')} required />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Priorité (1=Max)</label>
                                                <input type="number" min="1" className="input input-bordered focus:input-primary font-mono font-bold" value={priority} onChange={e => setPriority(e.target.value ? Number(e.target.value) : '')} required />
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Applicable à (Transport)</label>
                                            <div className="grid grid-cols-2 gap-2 p-3 bg-base-300 rounded-lg">
                                                {transportTypes.map((type) => (
                                                    <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm rounded-md"
                                                            checked={condition === 'ALL' ? true : condition.split(',').includes(type.value)}
                                                            onChange={() => handleConditionChange(type.value)}
                                                        />
                                                        <span className="text-xs font-bold group-hover:text-primary transition-colors">{type.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="divider text-xs uppercase opacity-40">Validité Horaire</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 text-[10px] uppercase font-bold">Début</label>
                                                <input type="time" className="input input-bordered input-sm focus:input-primary" value={startHour} onChange={e => setStartHour(e.target.value)} />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 text-[10px] uppercase font-bold">Fin</label>
                                                <input type="time" className="input input-bordered input-sm focus:input-primary" value={endHour} onChange={e => setEndHour(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="divider text-xs uppercase opacity-40">Validité Jours</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 text-[10px] uppercase font-bold">Du</label>
                                                <select className="select select-bordered select-sm focus:select-primary" value={startDay} onChange={e => setStartDay(e.target.value ? Number(e.target.value) : '')}>
                                                    <option value="">-</option>
                                                    {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 text-[10px] uppercase font-bold">Au</label>
                                                <select className="select select-bordered select-sm focus:select-primary" value={endDay} onChange={e => setEndDay(e.target.value ? Number(e.target.value) : '')}>
                                                    <option value="">-</option>
                                                    {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="divider text-xs uppercase opacity-40">Validité Calendrier</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 text-[10px] uppercase font-bold">Du (Date)</label>
                                                <input type="date" className="input input-bordered input-sm focus:input-primary" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 text-[10px] uppercase font-bold">Au (Date)</label>
                                                <input type="date" className="input input-bordered input-sm focus:input-primary" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-col gap-2">
                                            <button type="submit" className="btn btn-primary w-full shadow-lg font-bold">
                                                {editingRuleId ? 'Mettre à jour' : 'Créer la règle'}
                                            </button>
                                            {editingRuleId && (
                                                <button type="button" onClick={resetForm} className="btn btn-ghost btn-sm">Annuler</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* TABLE: Rules List */}
                        <div className="lg:col-span-3">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                </div>
                            ) : (
                                <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr className="bg-primary/5 text-primary">
                                                    <th className="font-black p-6">Type & Priorité</th>
                                                    <th className="font-black">Valeur</th>
                                                    <th className="font-black text-center">Transport</th>
                                                    <th className="font-black">Validité</th>
                                                    <th className="font-black text-center">Statut</th>
                                                    <th className="font-black text-right p-6">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rules.map((rule) => (
                                                    <tr key={rule.id} className="hover:bg-primary/5 transition-colors group">
                                                        <td className="p-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-base">{rule.ruleType}</span>
                                                                <span className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Priorité {rule.priority}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-2xl font-black text-primary">{rule.percentage}%</div>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="flex flex-wrap gap-1 justify-center">
                                                                {rule.condition?.split(',').map(c => (
                                                                    <span key={c} className="badge badge-sm font-bold badge-outline">{c.trim()}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex flex-col gap-1">
                                                                {rule.startHour ? (
                                                                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        {rule.startHour} → {rule.endHour}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] opacity-40 uppercase font-bold">H: 24h/24</div>
                                                                )}
                                                                {rule.startDay ? (
                                                                    <div className="flex items-center gap-2 text-xs font-bold">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                        {getDayLabel(rule.startDay)} → {getDayLabel(rule.endDay)}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] opacity-40 uppercase font-bold">J: Tous les jours</div>
                                                                )}
                                                                {rule.startDate && (
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-secondary mt-1">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                        {new Date(rule.startDate).toLocaleDateString()} → {new Date(rule.endDate || '').toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                onClick={() => toggleRuleStatus(rule)}
                                                                className={`btn btn-xs rounded-full px-4 border-none ${rule.active ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-error/20 text-error hover:bg-error/30'}`}
                                                            >
                                                                {rule.active ? 'ACTIF' : 'INACTIF'}
                                                            </button>
                                                        </td>
                                                        <td className="text-right p-6">
                                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleEditRule(rule)} className="btn btn-square btn-ghost btn-sm text-info hover:bg-info/10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button onClick={() => rule.id && handleDeleteRule(rule.id)} className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {rules.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-20 text-center opacity-40 italic">Aucune règle configurée.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
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

export default RulesManagement;
