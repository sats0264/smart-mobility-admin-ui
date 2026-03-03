import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { TransportLine, FareSection } from '../services/pricingService';

const BusManagement: React.FC = () => {
    const navigate = useNavigate();
    const [lines, setLines] = useState<TransportLine[]>([]);
    const [sections, setSections] = useState<FareSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

    // Form States
    const [newLineName, setNewLineName] = useState('');
    const [sectionOrder, setSectionOrder] = useState<number | ''>('');
    const [stationName, setStationName] = useState('');
    const [priceIncrement, setPriceIncrement] = useState<number | ''>('');
    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedLines, fetchedSections] = await Promise.all([
                pricingService.getTransportLines(),
                pricingService.getFareSections()
            ]);
            setLines(fetchedLines.filter(l => l.transportType === 'BUS'));
            setSections(fetchedSections);
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
            const newLine = await pricingService.createTransportLine({
                name: newLineName,
                transportType: 'BUS'
            });
            setNewLineName('');
            loadData();
            if (newLine.id) setSelectedLineId(newLine.id);
        } catch (error) {
            alert("Erreur lors de la création de la ligne.");
        }
    };

    const handleDeleteLine = async (id: number) => {
        if (!window.confirm("Supprimer cette ligne et toutes ses sections ?")) return;
        try {
            await pricingService.deleteTransportLine(id);
            if (selectedLineId === id) setSelectedLineId(null);
            loadData();
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleCreateOrUpdateSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLineId || sectionOrder === '' || priceIncrement === '') return;

        const sectionData: Partial<FareSection> = {
            lineId: selectedLineId,
            sectionOrder: Number(sectionOrder),
            stationName: stationName.trim() || undefined,
            priceIncrement: Number(priceIncrement)
        };

        try {
            if (editingSectionId) {
                await pricingService.updateFareSection(editingSectionId, sectionData);
            } else {
                await pricingService.createFareSection(sectionData as FareSection);
            }
            resetSectionForm();
            loadData();
        } catch (error) {
            alert("Erreur lors de l'enregistrement de la section.");
        }
    };

    const resetSectionForm = () => {
        setSectionOrder('');
        setStationName('');
        setPriceIncrement('');
        setEditingSectionId(null);
    };

    const handleEditSection = (section: FareSection) => {
        setEditingSectionId(section.id || null);
        setSectionOrder(section.sectionOrder);
        setStationName(section.stationName || '');
        setPriceIncrement(section.priceIncrement);
    };

    const handleDeleteSection = async (id: number) => {
        if (!window.confirm("Supprimer cette section ?")) return;
        try {
            await pricingService.deleteFareSection(id);
            loadData();
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    };

    const selectedLine = lines.find(l => l.id === selectedLineId);
    const filteredSections = sections
        .filter(s => s.lineId === selectedLineId)
        .sort((a, b) => a.sectionOrder - b.sectionOrder);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <header><Navbar /></header>

            <main className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-4xl font-bold text-base-content">Gestion <span className="text-primary">Bus Dakar Dem Dikk</span></h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* MASTER: Line List */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="card bg-base-200 shadow-sm border border-primary/10">
                                    <div className="card-body p-6">
                                        <h2 className="card-title text-xl mb-4 text-primary">Lignes de Bus</h2>
                                        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                                            {lines.map((line) => (
                                                <div
                                                    key={line.id}
                                                    onClick={() => setSelectedLineId(line.id || null)}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 flex justify-between items-center group
                                                        ${selectedLineId === line.id ? 'bg-primary text-primary-content border-primary shadow-md' : 'bg-base-100 hover:border-primary/50 border-transparent shadow-sm'}`}
                                                >
                                                    <span className="font-bold">{line.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`badge text-[10px] ${selectedLineId === line.id ? 'badge-ghost' : 'badge-primary badge-outline shadow-sm'}`}>ID: {line.id}</div>
                                                        {line.id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteLine(line.id!); }}
                                                                className={`btn btn-circle btn-xs btn-ghost hover:btn-error ${selectedLineId === line.id ? 'text-primary-content' : 'text-error opacity-0 group-hover:opacity-100'}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {lines.length === 0 && <p className="text-center opacity-50 py-4 italic">No lines available.</p>}
                                        </div>
                                        <div className="divider my-2"></div>
                                        <form onSubmit={handleCreateLine} className="flex gap-2">
                                            <input type="text" placeholder="Nouvelle ligne..." className="input input-sm input-bordered w-full" value={newLineName} onChange={(e) => setNewLineName(e.target.value)} required />
                                            <button type="submit" className="btn btn-sm btn-primary">Add</button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* DETAIL: Section Management */}
                            <div className="lg:col-span-2">
                                {selectedLine ? (
                                    <div className="card bg-base-200 shadow-xl border border-secondary/10 overflow-hidden">
                                        <div className="card-body p-0">
                                            {/* Header Section */}
                                            <div className="bg-secondary p-6 text-secondary-content flex justify-between items-center">
                                                <div>
                                                    <h2 className="text-2xl font-bold">{selectedLine.name}</h2>
                                                    <p className="text-xs opacity-80">Réseau Bus - Gestion des arrêts et sections</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="badge badge-outline badge-lg">{filteredSections.length} Arrêts</div>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                {/* Section Table */}
                                                <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-300 shadow-inner">
                                                    <table className="table w-full">
                                                        <thead>
                                                            <tr className="bg-base-300/50">
                                                                <th className="w-16">Ordre</th>
                                                                <th>Station / Arrêt</th>
                                                                <th>Incrément (FCFA)</th>
                                                                <th className="text-right w-32 px-6">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredSections.map((section) => (
                                                                <tr key={section.id} className="hover:bg-secondary/5 group transition-colors">
                                                                    <td className="font-mono font-bold text-secondary text-center">
                                                                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                                            {section.sectionOrder}
                                                                        </div>
                                                                    </td>
                                                                    <td><span className="font-bold text-base-content/80 text-lg">{section.stationName || `Section ${section.sectionOrder}`}</span></td>
                                                                    <td>
                                                                        <div className="badge badge-success gap-1 font-mono font-bold py-3">
                                                                            +{section.priceIncrement}
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-right px-6">
                                                                        <div className="flex gap-1 justify-end">
                                                                            <button onClick={() => handleEditSection(section)} className="btn btn-square btn-ghost btn-sm text-info hover:bg-info/20">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                            </button>
                                                                            <button onClick={() => section.id && handleDeleteSection(section.id)} className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/20">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {filteredSections.length === 0 && (
                                                                <tr><td colSpan={4} className="text-center py-16 opacity-50 italic">Aucune section définie pour cette ligne. Ajoutez votre premier point d'arrêt ci-dessous.</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Section Form */}
                                                <div className="mt-8 p-6 bg-base-100 rounded-2xl border border-secondary/20 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
                                                    <h3 className="font-bold text-xl mb-6 text-secondary flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        {editingSectionId ? 'Modifier l\'arrêt' : 'Ajouter un arrêt / station'}
                                                    </h3>
                                                    <form onSubmit={handleCreateOrUpdateSection} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                                                        <div className="form-control md:col-span-2">
                                                            <label className="label-text mb-2 font-bold text-xs uppercase tracking-wider text-base-content/60">Ordre</label>
                                                            <input type="number" min="1" className="input input-bordered focus:input-secondary transition-all font-mono font-bold" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value ? Number(e.target.value) : '')} required />
                                                        </div>
                                                        <div className="form-control md:col-span-6">
                                                            <label className="label-text mb-2 font-bold text-xs uppercase tracking-wider text-base-content/60">Nom de la Station</label>
                                                            <input type="text" placeholder="ex: Colobane" className="input input-bordered focus:input-secondary transition-all text-lg" value={stationName} onChange={(e) => setStationName(e.target.value)} />
                                                        </div>
                                                        <div className="form-control md:col-span-4">
                                                            <label className="label-text mb-2 font-bold text-xs uppercase tracking-wider text-base-content/60">Prix (+ FCFA)</label>
                                                            <div className="join">
                                                                <input type="number" min="0" step="50" className="input input-bordered join-item w-full focus:input-secondary transition-all font-bold text-success" value={priceIncrement} onChange={(e) => setPriceIncrement(e.target.value ? Number(e.target.value) : '')} required />
                                                                <span className="join-item btn btn-ghost bg-base-200 border-base-300 pointer-events-none px-2 text-xs">FCFA</span>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-12 flex justify-end gap-3 mt-2">
                                                            {editingSectionId && (
                                                                <button type="button" onClick={resetSectionForm} className="btn btn-ghost hover:bg-base-200 px-8">Annuler</button>
                                                            )}
                                                            <button type="submit" className={`btn btn-secondary px-10 shadow-lg hover:shadow-secondary/20 transition-all ${editingSectionId ? 'animate-pulse' : ''}`}>
                                                                {editingSectionId ? 'Enregistrer les modifications' : 'Ajouter cet arrêt'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-base-200/50 rounded-[2.5rem] border-4 border-dashed border-base-300 opacity-60 group hover:opacity-100 transition-opacity">
                                        <div className="p-10 rounded-full bg-base-100 shadow-inner mb-6 transition-transform group-hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.112a2 2 0 011.176-1.815l7-3.111a2 2 0 011.648 0l7 3.111A2 2 0 0121 5.112v10.376a2 2 0 01-1.176 1.815L15 19.333m-6 0V11m0 0l-9-4m9 4l9-4m-9 4v8m6-10V20m0-9l-9-4" /></svg>
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-base-content/70">Prêt à configurer ?</h3>
                                        <p className="text-lg text-base-content/50 max-w-xs text-center mt-2">Veuillez sélectionner ou créer une ligne de bus dans la liste à gauche pour voir ses points d'arrêt.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BusManagement;
