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

    // Create Line Form
    const [newLineName, setNewLineName] = useState('');

    // Create Section Form
    const [selectedLineId, setSelectedLineId] = useState<number | ''>('');
    const [sectionOrder, setSectionOrder] = useState<number | ''>('');
    const [priceIncrement, setPriceIncrement] = useState<number | ''>('');

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
            await pricingService.createTransportLine({
                name: newLineName,
                transportType: 'BUS'
            });
            setNewLineName('');
            loadData(); // Refresh list
        } catch (error) {
            alert("Erreur lors de la création de la ligne. Vérifiez si le backend (port 8080) est accessible.");
        }
    };

    const handleCreateSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLineId === '' || sectionOrder === '' || priceIncrement === '') return;

        try {
            await pricingService.createFareSection({
                lineId: Number(selectedLineId),
                sectionOrder: Number(sectionOrder),
                priceIncrement: Number(priceIncrement)
            });
            setSelectedLineId('');
            setSectionOrder('');
            setPriceIncrement('');
            loadData(); // Refresh list
        } catch (error) {
            alert("Erreur lors de la création de la section tarifaire.");
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
                        <h1 className="text-4xl font-bold text-base-content">Gestion <span className="text-primary">Bus Dakar Dem Dikk</span></h1>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Lignes de Bus */}
                            <div className="card bg-base-200 shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-primary">Lignes de Bus</h2>

                                    <ul className="list-none p-0 flex flex-col gap-3 max-h-64 overflow-y-auto mb-6 pr-2">
                                        {lines.map((line) => (
                                            <li key={line.id} className="bg-base-100 p-4 rounded-lg shadow-sm flex justify-between items-center border border-base-300">
                                                <span className="font-bold">{line.name}</span>
                                                <div className="badge badge-primary badge-outline text-xs">ID: {line.id}</div>
                                            </li>
                                        ))}
                                        {lines.length === 0 && (
                                            <div className="text-center opacity-50 py-4 italic">Aucune ligne de bus disponible.</div>
                                        )}
                                    </ul>

                                    <div className="divider text-sm text-base-content/60">Ajouter une ligne</div>

                                    <form onSubmit={handleCreateLine} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nom de la ligne (ex: Ligne 1)"
                                            className="input input-bordered w-full"
                                            value={newLineName}
                                            onChange={(e) => setNewLineName(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn btn-primary">Ajouter</button>
                                    </form>
                                </div>
                            </div>

                            {/* Sections Tarifaires */}
                            <div className="card bg-base-200 shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-secondary">Sections Tarifaires</h2>

                                    <div className="overflow-x-auto mb-6 max-h-64 overflow-y-auto pr-2">
                                        <table className="table table-zebra table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Ligne ID</th>
                                                    <th>Ordre Section</th>
                                                    <th>Incrément Tarifaire (FCFA)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sections.filter(s => lines.some(l => l.id === s.lineId)).map((section) => (
                                                    <tr key={section.id}>
                                                        <td className="font-semibold">{section.lineId}</td>
                                                        <td>Section {section.sectionOrder}</td>
                                                        <td className="text-success font-bold">+{section.priceIncrement}</td>
                                                    </tr>
                                                ))}
                                                {sections.length === 0 && (
                                                    <tr><td colSpan={3} className="text-center opacity-50 italic py-4">Aucune section tarifaire définie.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="divider text-sm text-base-content/60">Ajouter une section</div>

                                    <form onSubmit={handleCreateSection} className="flex flex-col gap-3">
                                        <div className="flex gap-2 w-full">
                                            <select
                                                className="select select-bordered flex-1"
                                                value={selectedLineId}
                                                onChange={(e) => setSelectedLineId(e.target.value ? Number(e.target.value) : '')}
                                                required
                                            >
                                                <option value="" disabled>Choisir une Ligne</option>
                                                {lines.map(l => <option key={l.id} value={l.id}>{l.name} (ID: {l.id})</option>)}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Ordre (ex: 1)"
                                                className="input input-bordered w-32"
                                                value={sectionOrder}
                                                onChange={(e) => setSectionOrder(e.target.value ? Number(e.target.value) : '')}
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <div className="join w-full">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Prix (ex: 150)"
                                                    className="input input-bordered join-item flex-1"
                                                    value={priceIncrement}
                                                    onChange={(e) => setPriceIncrement(e.target.value ? Number(e.target.value) : '')}
                                                    required
                                                />
                                                <button className="btn join-item pointer-events-none bg-base-300">FCFA</button>
                                            </div>
                                            <button type="submit" className="btn btn-secondary w-28">Ajouter</button>
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

export default BusManagement;
