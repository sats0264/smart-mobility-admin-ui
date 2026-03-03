import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { DiscountRule } from '../services/pricingService';

const DiscountManagement: React.FC = () => {
    const navigate = useNavigate();
    const [rules, setRules] = useState<DiscountRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [ruleType, setRuleType] = useState('OFFPEAK');
    const [percentage, setPercentage] = useState<number | ''>('');
    const [priority, setPriority] = useState<number | ''>(1);
    const [condition, setCondition] = useState('');
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
    const [active, setActive] = useState(true);
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const fetchedRules = await pricingService.getDiscountRules();
            setRules(fetchedRules);
        } catch (error) {
            console.error("Failed to load discount rules", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (percentage === '' || priority === '') return;

        const ruleData: Partial<DiscountRule> = {
            ruleType,
            percentage: Number(percentage),
            priority: Number(priority),
            condition,
            startHour: startHour ? `${startHour}:00` : undefined,
            endHour: endHour ? `${endHour}:00` : undefined,
            active
        };

        try {
            if (editingRuleId) {
                await pricingService.updateDiscountRule(editingRuleId, ruleData);
            } else {
                await pricingService.createDiscountRule(ruleData);
            }

            // Reset form
            handleCancelEdit();
            loadData(); // Refresh list
        } catch (error) {
            alert(`Erreur lors de la ${editingRuleId ? 'modification' : 'création'} de la règle.`);
        }
    };

    const handleEditRule = (rule: DiscountRule) => {
        setEditingRuleId(rule.id || null);
        setRuleType(rule.ruleType);
        setPercentage(rule.percentage);
        setPriority(rule.priority);
        setCondition(rule.condition || '');
        setStartHour(rule.startHour ? rule.startHour.substring(0, 5) : '');
        setEndHour(rule.endHour ? rule.endHour.substring(0, 5) : '');
        setActive(rule.active);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingRuleId(null);
        setRuleType('OFFPEAK');
        setPercentage('');
        setPriority(1);
        setCondition('');
        setStartHour('');
        setEndHour('');
        setActive(true);
    };

    const handleDeleteRule = async (id: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette règle ?")) return;

        try {
            await pricingService.deleteDiscountRule(id);
            loadData();
        } catch (error) {
            alert("Erreur lors de la suppression de la règle.");
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
                        <h1 className="text-4xl font-bold text-base-content">Gestion des <span className="text-primary">Remises</span></h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* List of Rules */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="card bg-base-200 shadow-sm">
                                    <div className="card-body">
                                        <h2 className="card-title text-2xl mb-4 text-primary">Règles Actives</h2>
                                        <div className="overflow-x-auto">
                                            <table className="table w-full">
                                                <thead>
                                                    <tr>
                                                        <th>Type</th>
                                                        <th>Valeur</th>
                                                        <th>Priorité</th>
                                                        <th>Transport</th>
                                                        <th>Horaires</th>
                                                        <th>Statut</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rules.map((rule) => (
                                                        <tr key={rule.id}>
                                                            <td><div className="badge badge-ghost font-mono">{rule.ruleType}</div></td>
                                                            <td className="font-bold text-success">{rule.percentage}%</td>
                                                            <td>{rule.priority}</td>
                                                            <td><div className="badge badge-outline badge-sm">{rule.condition || 'ALL'}</div></td>
                                                            <td className="text-xs">
                                                                {rule.startHour && rule.endHour ? (
                                                                    <span className="badge badge-primary badge-sm gap-1">
                                                                        {rule.startHour.substring(0, 5)} - {rule.endHour.substring(0, 5)}
                                                                    </span>
                                                                ) : <span className="opacity-50">24h/24</span>}
                                                            </td>
                                                            <td>
                                                                <div className={`badge ${rule.active ? 'badge-success' : 'badge-error'}`}>
                                                                    {rule.active ? 'Actif' : 'Inactif'}
                                                                </div>
                                                            </td>
                                                            <td className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditRule(rule)}
                                                                    className="btn btn-ghost btn-xs text-primary"
                                                                >
                                                                    Modifier
                                                                </button>
                                                                <button
                                                                    onClick={() => rule.id && handleDeleteRule(rule.id)}
                                                                    className="btn btn-ghost btn-xs text-error"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {rules.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="text-center py-8 opacity-50 italic">Aucune règle de remise définie.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="card bg-base-200 shadow-sm h-fit">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-secondary">
                                        {editingRuleId ? 'Modifier la Règle' : 'Nouvelle Règle'}
                                    </h2>
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Type de Règle</span></label>
                                            <select
                                                className="select select-bordered w-full"
                                                value={ruleType}
                                                onChange={(e) => setRuleType(e.target.value)}
                                                required
                                            >
                                                <option value="SUBSCRIPTION">SUBSCRIPTION</option>
                                                <option value="OFFPEAK">OFFPEAK</option>
                                                <option value="LOYALTY">LOYALTY</option>
                                                <option value="DAILY_CAP">DAILY_CAP</option>
                                            </select>
                                        </div>

                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Pourcentage (%)</span></label>
                                            <input
                                                type="number"
                                                min="0" max="100" step="0.01"
                                                className="input input-bordered w-full"
                                                value={percentage}
                                                onChange={(e) => setPercentage(e.target.value ? Number(e.target.value) : '')}
                                                placeholder="ex: 15.5"
                                                required
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Priorité (1 = max)</span></label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="input input-bordered w-full"
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value ? Number(e.target.value) : '')}
                                                required
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Condition (Optionnel)</span></label>
                                            <textarea
                                                className="textarea textarea-bordered h-20"
                                                value={condition}
                                                onChange={(e) => setCondition(e.target.value)}
                                                placeholder="ex: BUS,TER"
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label"><span className="label-text text-xs">Heure Début</span></label>
                                                <input
                                                    type="time"
                                                    className="input input-sm input-bordered w-full"
                                                    value={startHour}
                                                    onChange={(e) => setStartHour(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text text-xs">Heure Fin</span></label>
                                                <input
                                                    type="time"
                                                    className="input input-sm input-bordered w-full"
                                                    value={endHour}
                                                    onChange={(e) => setEndHour(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label cursor-pointer justify-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-success"
                                                    checked={active}
                                                    onChange={(e) => setActive(e.target.checked)}
                                                />
                                                <span className="label-text text-lg">Activer la règle</span>
                                            </label>
                                        </div>

                                        <div className="card-actions mt-6 flex flex-col gap-2">
                                            <button type="submit" className="btn btn-primary w-full shadow-lg">
                                                {editingRuleId ? 'Mettre à jour' : 'Créer la Règle'}
                                            </button>
                                            {editingRuleId && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="btn btn-ghost w-full"
                                                >
                                                    Annuler
                                                </button>
                                            )}
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

export default DiscountManagement;
