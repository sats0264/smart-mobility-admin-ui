import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-100">
            <header>
                <Navbar />
            </header>

            <main className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <h1 className="text-4xl font-bold text-base-content">Tableau de bord <span className="text-primary text-2xl font-normal ml-2">Administration</span></h1>
                        <div className="flex items-center gap-4">
                            <div className="badge badge-success gap-2 py-3 px-4 shadow-sm">
                                <div className="badge badge-xs badge-success bg-white"></div>
                                Connecté en tant que ADMIN
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="card bg-base-200 shadow-sm border border-primary/20 hover:border-primary transition-colors">
                            <div className="card-body">
                                <h2 className="card-title text-primary">Réseau Bus</h2>
                                <p>Gérer les lignes, arrêts et horaires de bus classiques.</p>
                                <div className="card-actions justify-end mt-4">
                                    <Link to="/admin/bus" className="btn btn-primary btn-sm">Gérer</Link>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-sm border border-secondary/20 hover:border-secondary transition-colors">
                            <div className="card-body">
                                <h2 className="card-title text-secondary">Réseau BRT</h2>
                                <p>Superviser les corridors et l'état de la flotte BRT.</p>
                                <div className="card-actions justify-end mt-4">
                                    <Link to="/admin/brt" className="btn btn-secondary btn-sm">Gérer</Link>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title">Réseau TER</h2>
                                <p>Contrôler la régularité et les incidents sur les voies TER.</p>
                                <div className="card-actions justify-end mt-4">
                                    <button className="btn btn-primary btn-sm">Gérer</button>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title">Utilisateurs</h2>
                                <p>Gérer les accès et les profils des voyageurs et agents.</p>
                                <div className="card-actions justify-end mt-4">
                                    <button className="btn btn-primary btn-sm">Gérer</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
