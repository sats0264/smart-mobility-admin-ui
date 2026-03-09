import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import keycloak from '../keycloak';

const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(!!keycloak.authenticated);
    if (keycloak.tokenParsed) {
      setUsername(keycloak.tokenParsed.preferred_username || '');
    }
  }, [location]);

  const confirmLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <>
      <div className="navbar bg-base-100/80 backdrop-blur-md shadow-md sticky top-0 z-50 px-4 w-full flex justify-between items-center border-b border-base-200 min-h-[4rem]">
        <div className="flex-none flex items-center gap-2">
          <Link to={isAuthenticated ? "/admin" : "/"} className="text-xl font-black tracking-tight text-primary hover:opacity-80 transition-all cursor-pointer whitespace-nowrap">
            SmartMobility<span className="text-base-content">SN</span>
          </Link>
          {isAuthenticated && (
            <div className="hidden 2xl:flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] pl-4 border-l border-base-content/20 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
              {username}
            </div>
          )}
        </div>

        <div className="flex-grow flex justify-center px-2">
          <ul className="menu menu-horizontal flex-nowrap px-0 font-semibold text-sm gap-1">
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/admin" className={`px-3 py-2 flex items-center gap-2 transition-all duration-300 rounded-xl ${location.pathname === '/admin' ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' : 'hover:bg-primary/10 hover:text-primary'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Accueil
                  </Link>
                </li>

                {/* DROPDOWN: Gestion Réseau */}
                <li className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className="px-3 py-2 flex items-center gap-1 transition-all duration-300 hover:bg-base-200 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Gestion Réseau
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 mt-1 border border-base-300">
                    <li><Link to="/admin/bus" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">🚌 <span className="flex-1">Lignes Bus</span></Link></li>
                    <li><Link to="/admin/brt" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">⚡ <span className="flex-1">Lignes BRT</span></Link></li>
                    <li><Link to="/admin/ter" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">🚆 <span className="flex-1">Lignes TER</span></Link></li>
                  </ul>
                </li>

                {/* DROPDOWN: Offres & Tarifs */}
                <li className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className="px-3 py-2 flex items-center gap-1 transition-all duration-300 hover:bg-base-200 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Offres & Tarifs
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-64 mt-1 border border-base-300">
                    <li><Link to="/admin/discounts" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">🏷️ <span className="flex-1">Règles & Tarification</span></Link></li>
                    <li><Link to="/admin/catalog" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">📖 <span className="flex-1">Catalogue d'Offres</span></Link></li>
                  </ul>
                </li>

                {/* DROPDOWN: Activités */}
                <li className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className={`px-3 py-2 flex items-center gap-1 transition-all duration-300 rounded-xl ${(location.pathname.includes('/billing') || location.pathname.includes('/trips')) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Opérations
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 mt-1 border border-base-300">
                    <li>
                      <Link to="/admin/billing" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Finances
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/trips" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        Trajets
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* DROPDOWN: Système / Administration */}
                <li className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className={`px-3 py-2 flex items-center gap-1 transition-all duration-300 rounded-xl ${(location.pathname.includes('/users') || location.pathname.includes('/notifications') || location.pathname.includes('/monitoring') || location.pathname.includes('/test-qr')) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                    Administration
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[200] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-60 mt-1 border border-base-300">
                    <li>
                      <Link to="/admin/users" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354l1.1-.553-1.1-.553V4.354zM12 4.354v-1.1L10.9 3.8l1.1.554zM12 4.354l-1.1-.553 1.1-.554v1.107z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        Utilisateurs
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/notifications" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        Notifications
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/monitoring" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Monitoring Système
                      </Link>
                    </li>
                    <div className="divider my-1 opacity-50"></div>
                    <li>
                      <Link to="/admin/test-qr" className="hover:bg-primary/10 hover:text-primary py-3 rounded-xl flex items-center gap-3 italic text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        Labo Test QR
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="flex-none flex items-center gap-3 pl-4">
          <Link to="/" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 hover:bg-base-200 transition-all duration-300 rounded-lg text-xs font-medium opacity-60 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            A propos
          </Link>

          {isAuthenticated ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="btn btn-sm btn-outline btn-error font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap px-4"
            >
              Déconnexion
            </button>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap px-6">
              Connexion
            </Link>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Confirmation de déconnexion
            </h3>
            <p className="py-4">Êtes-vous sûr de vouloir vous déconnecter de la plateforme SmartMobility SN ?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowLogoutConfirm(false)}>Annuler</button>
              <button className="btn btn-error" onClick={confirmLogout}>Oui, me déconnecter</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
