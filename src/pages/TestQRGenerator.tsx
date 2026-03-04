import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pricingService } from '../services/pricingService';
import type { TransportLine, FareSection } from '../services/pricingService';

const TestQRGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [lines, setLines] = useState<TransportLine[]>([]);
    const [sections, setSections] = useState<FareSection[]>([]);
    const [selectedType, setSelectedType] = useState<'BUS' | 'BRT' | 'TER'>('BUS');
    const [selectedLineId, setSelectedLineId] = useState<number | ''>('');
    const [selectedStation, setSelectedStation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [qrValue, setQrValue] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [fetchedLines, fetchedSections] = await Promise.all([
                    pricingService.getTransportLines(),
                    pricingService.getFareSections()
                ]);
                setLines(fetchedLines);
                setSections(fetchedSections);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredLines = lines.filter(line => line.transportType === selectedType);

    const handleLineChange = (id: number) => {
        setSelectedLineId(id);
        setSelectedStation('');
        setQrValue('');
    };

    const generateQR = () => {
        if (!selectedLineId || !selectedStation) return;

        const data = {
            transportType: selectedType,
            transportLineId: selectedLineId,
            stationName: selectedStation,
            timestamp: new Date().toISOString()
        };

        setQrValue(JSON.stringify(data));
    };

    const downloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `QR_${selectedType}_${selectedStation}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const getLineStations = () => {
        const line = lines.find(l => l.id === selectedLineId);
        if (!line) return [];

        // 1. First try to get stations from FareSections (Database source)
        const lineSections = sections
            .filter(s => s.lineId === selectedLineId)
            .sort((a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0))
            .map(s => s.stationName)
            .filter((name): name is string => !!name);

        if (lineSections.length > 0) return lineSections;

        // 2. Fallback to direct stations property (Mock source)
        return line.stations || [];
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <Navbar />

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Labo <span className="text-primary italic">QR Code</span></h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Configuration Card */}
                        <div className="card bg-base-200 shadow-xl border border-primary/10">
                            <div className="card-body">
                                <h2 className="card-title text-xl mb-4">Configuration du Scan</h2>

                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Type de Transport</label>
                                        <div className="tabs tabs-boxed bg-base-300 p-1">
                                            <button
                                                className={`tab tab-sm flex-1 font-bold ${selectedType === 'BUS' ? 'tab-active' : ''}`}
                                                onClick={() => setSelectedType('BUS')}
                                            >BUS</button>
                                            <button
                                                className={`tab tab-sm flex-1 font-bold ${selectedType === 'TER' ? 'tab-active' : ''}`}
                                                onClick={() => setSelectedType('TER')}
                                            >TER</button>
                                            <button
                                                className={`tab tab-sm flex-1 font-bold ${selectedType === 'BRT' ? 'tab-active' : ''}`}
                                                onClick={() => setSelectedType('BRT')}
                                            >BRT</button>
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Ligne de Transport</label>
                                        <select
                                            className="select select-bordered w-full focus:select-primary"
                                            value={selectedLineId}
                                            onChange={(e) => handleLineChange(Number(e.target.value))}
                                            disabled={isLoading}
                                        >
                                            <option value="">Sélectionner une ligne</option>
                                            {filteredLines.map(line => (
                                                <option key={line.id} value={line.id}>{line.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label-text mb-2 font-bold text-xs uppercase opacity-60">Station / Point de Scan</label>
                                        <select
                                            className="select select-bordered w-full focus:select-primary"
                                            value={selectedStation}
                                            onChange={(e) => setSelectedStation(e.target.value)}
                                            disabled={!selectedLineId || isLoading}
                                        >
                                            <option value="">Sélectionner une station</option>
                                            {getLineStations().map(station => (
                                                <option key={station} value={station}>{station}</option>
                                            ))}
                                        </select>
                                        {!selectedLineId && <p className="text-[10px] text-info mt-1 italic">Veuillez d'abord choisir une ligne</p>}
                                    </div>

                                    <button
                                        className="btn btn-primary w-full mt-4 font-bold"
                                        disabled={!selectedLineId || !selectedStation}
                                        onClick={generateQR}
                                    >
                                        Générer le QR Code
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Preview Card */}
                        <div className="card bg-base-200 shadow-xl border border-primary/10 flex items-center justify-center p-8 min-h-[400px]">
                            {qrValue ? (
                                <div className="text-center space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-inner inline-block">
                                        <QRCodeSVG
                                            id="qr-code-svg"
                                            value={qrValue}
                                            size={200}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold opacity-60 uppercase mb-1">Contenu du Code</div>
                                        <div className="badge badge-outline gap-2 font-mono text-[10px] p-4 h-auto max-w-xs break-all">
                                            {qrValue}
                                        </div>
                                    </div>
                                    <button onClick={downloadQR} className="btn btn-outline btn-secondary gap-2 font-bold">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Télécharger Image (PNG)
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center opacity-20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                    <p className="font-bold uppercase tracking-widest text-sm text-center">Configurez les options<br />pour générer l'aperçu</p>
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

export default TestQRGenerator;
