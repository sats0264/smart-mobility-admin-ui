import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { TransportLine, FareSection } from '../services/pricingService';

const BrtManagement: React.FC = () => {
    const navigate = useNavigate();
    const [lines, setLines] = useState<TransportLine[]>([]);
    const [sections, setSections] = useState<FareSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

    // Form States
    const [newLineName, setNewLineName] = useState('');
    const [sectionOrder, setSectionOrder] = useState<number | ''>('');
    const [stationName, setStationName] = useState('');
    const [zone, setZone] = useState<number | ''>('');
    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedLines, fetchedSections] = await Promise.all([
                pricingService.getTransportLines(),
                pricingService.getFareSections()
            ]);
            setLines(fetchedLines.filter(l => l.transportType === 'BRT'));
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
                transportType: 'BRT'
            });
            setNewLineName('');
            loadData();
            if (newLine.id) setSelectedLineId(newLine.id);
        } catch (error) {
            alert("Erreur lors de la création du corridor BRT.");
        }
    };

    const handleDeleteLine = async (id: number) => {
        if (!window.confirm("Supprimer ce corridor BRT et ses arrêts ?")) return;
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
        if (!selectedLineId || sectionOrder === '') return;
        const sectionData: Partial<FareSection> = {
            lineId: selectedLineId,
            sectionOrder: Number(sectionOrder),
            stationName: stationName.trim(),
            zone: zone !== '' ? Number(zone) : undefined
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
            alert("Erreur lors de l'enregistrement de l'arrêt.");
        }
    };

    const resetSectionForm = () => {
        setSectionOrder('');
        setStationName('');
        setZone('');
        setEditingSectionId(null);
    };

    const handleEditSection = (section: FareSection) => {
        setEditingSectionId(section.id || null);
        setSectionOrder(section.sectionOrder);
        setStationName(section.stationName || '');
        setZone(section.zone || '');
    };

    const handleDeleteSection = async (id: number) => {
        if (!window.confirm("Supprimer cette station ?")) return;
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
                        <h1 className="text-4xl font-bold">Gestion <span className="text-secondary">BRT Dakar</span></h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-lg text-secondary"></span></div>
                    ) : (
                        <div className="flex flex-col gap-12">

                            {/* MASTER-DETAIL SECTION */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* MASTER: Line List */}
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="card bg-base-200 shadow-sm border border-secondary/10">
                                        <div className="card-body p-6">
                                            <h2 className="card-title text-xl mb-4 text-secondary">Corridors BRT</h2>
                                            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2">
                                                {lines.map((line) => (
                                                    <div
                                                        key={line.id}
                                                        onClick={() => setSelectedLineId(line.id || null)}
                                                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 flex justify-between items-center group
                                                            ${selectedLineId === line.id ? 'bg-secondary text-secondary-content border-secondary shadow-md' : 'bg-base-100 hover:border-secondary/50 border-transparent shadow-sm'}`}
                                                    >
                                                        <span className="font-bold">{line.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`badge text-[10px] ${selectedLineId === line.id ? 'badge-ghost' : 'badge-secondary badge-outline'}`}>ID: {line.id}</div>
                                                            {line.id && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLine(line.id!); }}
                                                                    className={`btn btn-circle btn-xs btn-ghost hover:btn-error ${selectedLineId === line.id ? 'text-secondary-content' : 'text-error opacity-0 group-hover:opacity-100'}`}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="divider my-2"></div>
                                            <form onSubmit={handleCreateLine} className="flex gap-2">
                                                <input type="text" placeholder="Nouveau corridor..." className="input input-sm input-bordered w-full focus:input-secondary" value={newLineName} onChange={(e) => setNewLineName(e.target.value)} required />
                                                <button type="submit" className="btn btn-sm btn-secondary">Add</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* DETAIL: Station Management */}
                                <div className="lg:col-span-2">
                                    {selectedLine ? (
                                        <div className="card bg-base-200 shadow-xl border border-secondary/10 overflow-hidden">
                                            <div className="card-body p-0">
                                                <div className="bg-secondary p-6 text-secondary-content flex justify-between items-center">
                                                    <div>
                                                        <h2 className="text-2xl font-bold">{selectedLine.name}</h2>
                                                        <p className="text-xs opacity-80">Bus Rapid Transit - Gestion des stations</p>
                                                    </div>
                                                    <div className="badge badge-outline badge-lg">{filteredSections.length} Stations</div>
                                                </div>

                                                <div className="p-6">
                                                    <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-300 shadow-inner">
                                                        <table className="table w-full">
                                                            <thead>
                                                                <tr className="bg-base-200">
                                                                    <th className="w-16">Ordre</th>
                                                                    <th>Station</th>
                                                                    <th>Zone</th>
                                                                    <th className="text-right w-32 px-6">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {filteredSections.map((section) => (
                                                                    <tr key={section.id} className="hover:bg-secondary/5 group transition-colors">
                                                                        <td className="font-mono font-bold text-secondary text-center">#{section.sectionOrder}</td>
                                                                        <td><span className="font-bold text-lg">{section.stationName}</span></td>
                                                                        <td>
                                                                            {section.zone ? (
                                                                                <div className="badge badge-accent badge-outline font-bold">Zone {section.zone}</div>
                                                                            ) : (
                                                                                <span className="opacity-30">-</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="text-right px-6">
                                                                            <div className="flex gap-1 justify-end">
                                                                                <button onClick={() => handleEditSection(section)} className="btn btn-square btn-ghost btn-sm text-info hover:bg-info/10">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                                </button>
                                                                                <button onClick={() => section.id && handleDeleteSection(section.id)} className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/10">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div className="mt-8 p-6 bg-base-100 rounded-2xl border border-secondary/20 shadow-sm">
                                                        <h3 className="font-bold text-xl mb-6 text-secondary">{editingSectionId ? 'Modifier la station' : 'Ajouter une station'}</h3>
                                                        <form onSubmit={handleCreateOrUpdateSection} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                            <div className="form-control md:col-span-2">
                                                                <label className="label-text mb-2 font-bold text-xs opacity-60">Ordre</label>
                                                                <input type="number" min="1" className="input input-bordered focus:input-secondary font-mono font-bold" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value ? Number(e.target.value) : '')} required />
                                                            </div>
                                                            <div className="form-control md:col-span-1">
                                                                <label className="label-text mb-2 font-bold text-xs opacity-60">Zone</label>
                                                                <input type="number" min="1" className="input input-bordered focus:input-secondary font-mono font-bold" value={zone} onChange={(e) => setZone(e.target.value ? Number(e.target.value) : '')} />
                                                            </div>
                                                            <div className="form-control md:col-span-6">
                                                                <label className="label-text mb-2 font-bold text-xs opacity-60">Nom de la Station</label>
                                                                <input type="text" placeholder="ex: Sacré Coeur" className="input input-bordered focus:input-secondary text-lg" value={stationName} onChange={(e) => setStationName(e.target.value)} required />
                                                            </div>
                                                            <div className="md:col-span-3 flex items-end gap-2">
                                                                <button type="submit" className="btn btn-secondary w-full shadow-lg">{editingSectionId ? 'Update' : 'Ajouter'}</button>
                                                                {editingSectionId && <button type="button" onClick={resetSectionForm} className="btn btn-ghost">X</button>}
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-base-200/50 rounded-[2.5rem] border-4 border-dashed border-base-300 opacity-60">
                                            <p className="text-2xl font-black text-base-content/40">SÉLECTIONNEZ UN CORRIDOR BRT</p>
                                        </div>
                                    )}
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
