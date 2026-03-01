import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Login: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Simulate an API call to the backend authentication endpoint
            // In a real scenario, this would be a fetch() call to your backend/Keycloak
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock validation logic matching requirements:
            // "il vérifiera si l'utilisateur existe dans la base et si son rôle est administrateur"
            let userRole = null;
            let userExists = false;

            // Mock users for demonstration
            if (login === 'admin' && password === 'admin123') {
                userExists = true;
                userRole = 'ADMIN';
            } else if (login === 'user' && password === 'user123') {
                userExists = true;
                userRole = 'USER';
            }

            if (!userExists) {
                setError("Utilisateur introuvable ou identifiants incorrects.");
                return;
            }

            if (userRole !== 'ADMIN') {
                setError("Accès refusé. Seuls les administrateurs peuvent s'authentifier sur cette interface.");
                return;
            }

            // Success
            console.log('Login successful as ADMIN');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'ADMIN');
            navigate('/admin'); // Or wherever the admin dashboard is

        } catch (err) {
            setError("Une erreur est survenue lors de la connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-base-200">
            <header>
                <Navbar />
            </header>

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="card w-full max-w-md bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-3xl font-bold justify-center mb-6 text-primary">Connexion</h2>

                        {error && (
                            <div className="alert alert-error text-sm font-medium mb-4 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">Identifiant (Login)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="admin"
                                    className="input input-bordered w-full focus:input-primary"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control w-full mb-6">
                                <label className="label">
                                    <span className="label-text font-semibold">Mot de passe</span>
                                    <a href="#" className="label-text-alt link link-hover text-primary">Oublié ?</a>
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input input-bordered w-full focus:input-primary"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full text-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <span className="loading loading-spinner"></span> : "Se connecter"}
                                </button>
                            </div>
                        </form>

                        <div className="divider text-base-content/50 my-6">Ou</div>

                        <div className="text-center text-sm">
                            <p>
                                Vous n'avez pas de compte ?{' '}
                                <a href="#" className="link link-primary font-bold hover:underline">Demander un accès</a>
                            </p>
                            <div className="mt-4 text-xs opacity-60">
                                Identifiants démo: admin / admin123
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
