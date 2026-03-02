import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { TransportLine, FareSection } from '../services/pricingService';

const TerManagement: React.FC = () => {
    const navigate = useNavigate();
    const [lines, setLines] = useState<TransportLine[]>([]);
    const [sections, setSections] = useState<FareSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create Line Form
    const [newLineName, setNewLineName] = useState('');

    // Create Section Form
    const [selectedLineId, setSelectedLineId] = useState<number | ''>('');
    const [sectionOrder, setSectionOrder] = useState<number | ''>('');
    const [stationName, setStationName] = useState('');
    const [priceIncrement, setPriceIncrement] = useState<number | ''>(500);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedLines, fetchedSections] = await Promise.all([
                pricingService.getTransportLines(),
                pricingService.getFareSections()
            ]);
            setLines(fetchedLines.filter(l => l.transportType === 'TER'));
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
                transportType: 'TER'
            });
            setNewLineName('');
            loadData();
        } catch (error) {
            alert("Erreur lors de la création de la ligne TER.");
        }
    };

    const handleCreateSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLineId === '' || sectionOrder === '') return;

        try {
            await pricingService.createFareSection({
                lineId: Number(selectedLineId),
                sectionOrder: Number(sectionOrder),
                stationName: stationName.trim(),
                priceIncrement: Number(priceIncrement)
            });
            setSelectedLineId('');
            setSectionOrder('');
            setStationName('');
            setPriceIncrement(500);
            loadData();
        } catch (error) {
            alert("Erreur lors de la création de l'arrêt TER.");
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
                        <h1 className="text-4xl font-bold text-base-content">Gestion <span className="text-error text-5xl">TER</span></h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <span className="loading loading-spinner loading-lg text-error"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Lignes TER */}
                            <div className="card bg-base-200 shadow-sm border border-error/20">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-error flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Infrastructures TER
                                    </h2>

                                    <ul className="list-none p-0 flex flex-col gap-3 mb-6">
                                        {lines.map((line) => (
                                            <li key={line.id} className="bg-base-100 rounded-lg shadow-sm border border-base-300 overflow-hidden">
                                                <div className="p-4 flex justify-between items-center bg-error/5">
                                                    <div>
                                                        <span className="font-bold text-lg text-error">{line.name}</span>
                                                        <p className="text-xs opacity-70">Réseau ferré express.</p>
                                                    </div>
                                                    <div className="badge badge-error badge-outline text-xs">ID: {line.id}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="divider text-sm text-base-content/60">Ajouter une ligne TER</div>
                                    <form onSubmit={handleCreateLine} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nom de la ligne (ex: TER Dakar-AIBD)"
                                            className="input input-bordered w-full focus:input-error"
                                            value={newLineName}
                                            onChange={(e) => setNewLineName(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn btn-error">Ajouter</button>
                                    </form>
                                </div>
                            </div>

                            {/* Sections Tarifaires TER */}
                            <div className="card bg-base-200 shadow-sm border border-warning/30">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-4 text-warning flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Gares & Tarifs par zone
                                    </h2>

                                    <div className="overflow-y-auto max-h-64 pr-2 mb-6">
                                        <table className="table table-zebra table-sm w-full bg-base-100 shadow-sm rounded-lg">
                                            <thead>
                                                <tr>
                                                    <th>Gare (Section)</th>
                                                    <th className="text-right">Incrément</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sections.filter(s => lines.some(l => l.id === s.lineId)).map((section) => (
                                                    <tr key={section.id}>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <span className="badge badge-error badge-sm">{section.sectionOrder}</span>
                                                                <span className="font-medium">{section.stationName || `Secteur ${section.sectionOrder}`}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right text-success font-bold">+{section.priceIncrement} FCFA</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="divider text-sm text-base-content/60">Ajouter une Gare / Section</div>
                                    <form onSubmit={handleCreateSection} className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <select
                                                className="select select-bordered flex-1 focus:select-warning"
                                                value={selectedLineId}
                                                onChange={(e) => setSelectedLineId(e.target.value ? Number(e.target.value) : '')}
                                                required
                                            >
                                                <option value="" disabled>Ligne TER</option>
                                                {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Nom de la Gare"
                                                className="input input-bordered flex-1 focus:input-warning"
                                                value={stationName}
                                                onChange={(e) => setStationName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Ordre"
                                                className="input input-bordered w-24 focus:input-warning"
                                                value={sectionOrder}
                                                onChange={(e) => setSectionOrder(e.target.value ? Number(e.target.value) : '')}
                                                required
                                            />
                                            <div className="join flex-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Prix"
                                                    className="input input-bordered join-item w-full focus:input-warning"
                                                    value={priceIncrement}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setPriceIncrement(val === '' ? '' : Number(val));
                                                    }}
                                                    required
                                                />
                                                <span className="join-item btn pointer-events-none bg-base-300">FCFA</span>
                                            </div>
                                            <button type="submit" className="btn btn-warning text-white">Ajouter</button>
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

export default TerManagement;
