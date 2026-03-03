# Configuration du Frontend Admin Web (http://localhost:5173/)

## 📋 Résumé des configurations appliquées

### 1. **CORS Configuration (Gateway)**
- ✅ Autorise `http://localhost:5173` (Frontend Admin)
- ✅ Autorise les headers personnalisés (X-User-Id, X-User-Email, X-User-Name)
- ✅ Autorise les credentials
- ✅ Cache preflight pour 1 heure

### 2. **Keycloak Integration**
**Fichier:** `keycloak.ts`
- ✅ Configuration avec variables d'environnement (VITE_KEYCLOAK_URL, etc.)
- ✅ Gestion automatique du refresh de token
- ✅ Listeners pour expiration et refresh du token
- ✅ PKCE activé pour sécurité (S256)
- ✅ Logging activé pour debug

### 3. **Environment Variables**
**Fichier:** `.env.local`
```env
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=smart-mobility
VITE_KEYCLOAK_CLIENT_ID=smart-mobility-app
VITE_API_URL=http://localhost:8765
VITE_ENV=development
```

### 4. **API Service (Centralisé)**
**Fichier:** `services/apiService.ts`
- ✅ Gestion automatique du Bearer token
- ✅ Refresh du token si expiré (30 secondes avant expiration)
- ✅ Gestion des erreurs 401 (redirect vers login)
- ✅ Headers CORS nécessaires inclus
- ✅ Support GET, POST, PUT, DELETE

### 5. **Protected Routes**
**Fichier:** `components/ProtectedRoute.tsx`
- ✅ Vérification de l'authentification
- ✅ Vérification des rôles (requiredRole)
- ✅ Affichage d'une erreur d'accès si permissions insuffisantes
- ✅ Redirection vers login si non authentifié

### 6. **Vite Configuration**
**Fichier:** `vite.config.ts`
- ✅ Port développement: 5173
- ✅ Proxy `/admin` vers `http://localhost:8765/admin`
- ✅ Proxy `/api` vers `http://localhost:8765/api`
- ✅ Build optimisé avec Terser

### 7. **Main.tsx (Authentification)**
- ✅ Initialisation Keycloak avec `onLoad: 'login-required'`
- ✅ Gestion des erreurs d'initialisation
- ✅ Affichage d'un écran de chargement
- ✅ Affichage d'une erreur si Keycloak est indisponible

### 8. **App.tsx (Routing)**
- ✅ Routes protégées avec `ProtectedRoute`
- ✅ Vérification du rôle `admin` pour les pages d'administration
- ✅ Redirection automatique vers login si accès refusé

### 9. **Services API**
**Fichier:** `services/pricingService.ts`
- ✅ Mise à jour pour utiliser le nouveau apiService
- ✅ Endpoints admin pour gestion des transports
- ✅ Fallback data si backend indisponible

## 🚀 Démarrage du frontend

```bash
cd smart-mobility-admin-ui

# Installation des dépendances
npm install

# Développement (port 5173)
npm run dev

# Build production
npm run build
```

## 🔐 Configuration Keycloak requise

1. **Clients → smart-mobility-app**
   - Access Type: `public` (OIDC)
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`
   - Roles: `admin`, `user`

2. **Users**
   - Créer un utilisateur avec le rôle `admin`

## 📱 Endpoints disponibles

### Admin (Protégés - Role: admin)
- `GET /admin/transport-lines` - Liste des lignes
- `POST /admin/transport-lines` - Créer une ligne
- `GET /admin/fare-sections` - Liste des sections tarifaires
- `POST /admin/fare-sections` - Créer une section
- `GET /admin/zones` - Liste des zones
- `POST /admin/zones` - Créer une zone
- `GET /admin/discount-rules` - Liste des règles de réduction
- `POST /admin/discount-rules` - Créer une règle
- `DELETE /admin/discount-rules/{id}` - Supprimer une règle

## ✅ Checklist d'intégration

- [x] CORS correctement configuré pour localhost:5173
- [x] Keycloak intégré avec refresh automatique du token
- [x] ApiService centralisé avec gestion du token
- [x] Routes protégées avec vérification des rôles
- [x] Vite proxy configuré pour développement
- [x] Variables d'environnement configurées
- [x] Composants d'authentification en place
- [x] Services API mis à jour

## 🐛 Troubleshooting

### Erreur CORS
- Vérifier que le gateway écoute sur http://localhost:8765
- Vérifier la configuration CorsConfig.java

### Token expiré
- L'apiService gère le refresh automatiquement
- Si toujours expiré, l'utilisateur est redirigé vers login

### Keycloak indisponible
- Vérifier que Keycloak tourne sur http://localhost:8080
- Vérifier les logs pour erreurs de configuration

### Routes non protégées
- Vérifier que ProtectedRoute est utilisé dans App.tsx
- Vérifier la variable requiredRole

## 📝 Notes importantes

1. Le frontend utilise PKCE (Proof Key for Code Exchange) pour plus de sécurité
2. Le token est automatiquement rafraîchi 30 secondes avant expiration
3. Les appels API incluent automatiquement le Bearer token
4. Les erreurs 401 provoquent une redirection vers login
5. Les pages non authentifiées requièrent d'abord une connexion

---
Date: 2026-03-02
Status: ✅ COMPLÉTÉ
