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
      <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-4 w-full justify-between items-center overflow-x-auto flex-nowrap">
        <div className="flex-none pr-4 flex items-center gap-3">
          <Link to={isAuthenticated ? "/admin" : "/"} className="text-2xl font-black tracking-tight text-primary hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap">
            SmartMobility<span className="text-base-content">SN</span>
          </Link>
          {isAuthenticated && (
            <div className="hidden lg:block text-xs font-bold opacity-50 uppercase tracking-widest pl-2 border-l border-base-content/10">
              Admin: {username}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ul className="menu menu-horizontal px-1 font-medium text-sm md:text-base gap-1 flex-nowrap justify-center min-w-max w-full">
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/admin" className="hover:bg-primary/10 text-primary font-bold rounded-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Accueil
                  </Link>
                </li>
                <li><Link to="/admin/bus" className="hover:bg-base-200 rounded-lg">Réseau Bus</Link></li>
                <li><Link to="/admin/brt" className="hover:bg-base-200 rounded-lg">Lignes BRT</Link></li>
                <li><Link to="/admin/ter" className="hover:bg-base-200 rounded-lg">Horaires TER</Link></li>
                <li><Link to="/admin/discounts" className="hover:bg-base-200 rounded-lg">Remises</Link></li>
                <li><Link to="/admin/catalog" className="hover:bg-base-200 rounded-lg">Catalogue</Link></li>
              </>
            )}
            <li><Link to="/" className="hover:bg-base-200 rounded-lg">A propos</Link></li>
          </ul>
        </div>
        <div className="flex-none pl-4">
          {isAuthenticated ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="btn btn-outline btn-error font-bold shadow-sm hover:shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Déconnexion
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
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
