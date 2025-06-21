# EventSpace Pro 🎉🏢

Application complète de réservation d'espaces événementiels avec React, Node.js et MongoDB.

## 🚀 Fonctionnalités

- **Authentification complète** : Inscription, connexion, gestion des profils
- **Gestion des espaces** : Création, modification, recherche et réservation d'espaces
- **Système de réservation** : Réservation en temps réel avec gestion des disponibilités
- **Interface admin** : Tableau de bord pour la gestion des utilisateurs et espaces
- **Upload d'images** : Gestion des photos d'espaces
- **Notifications** : Système de notifications en temps réel

## 🛠️ Technologies utilisées

### Frontend
- **React 19** avec Vite
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **Tailwind CSS** pour le styling
- **Context API** pour la gestion d'état

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **bcryptjs** pour le hashage des mots de passe

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **MongoDB** installé et en cours d'exécution
- **npm** ou **yarn**

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd eventspace-pro
```

### 2. Installer les dépendances
```bash
# Installer toutes les dépendances (racine, backend et frontend)
npm run install-all
```

### 3. Configuration de la base de données

Assurez-vous que MongoDB est en cours d'exécution sur votre machine :
```bash
# Démarrer MongoDB (Windows)
mongod

# Ou sur macOS/Linux
sudo systemctl start mongod
```

### 4. Configuration des variables d'environnement

#### Backend (.env)
Créez un fichier `.env` dans le dossier `backend/` :
```env
# Configuration du serveur
PORT=5001

# Configuration JWT
JWT_SECRET=mon_secret_jwt_super_securise_2024_eventspace_pro

# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/eventspace

# Configuration des uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```

## 🚀 Démarrage

### Démarrage rapide (recommandé)
```bash
# Démarrer le backend et le frontend simultanément
npm run dev
```

### Démarrage séparé
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## 📱 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001
- **API Health Check** : http://localhost:5001/api/health

## 🗄️ Structure de la base de données

### Collections MongoDB
- **users** : Utilisateurs et administrateurs
- **spaces** : Espaces événementiels
- **bookings** : Réservations

### Modèles principaux
- **User** : Gestion des utilisateurs avec rôles
- **Space** : Espaces avec images et disponibilités
- **Booking** : Réservations avec statuts

## 🔐 Authentification

L'application utilise JWT pour l'authentification :
- Les tokens sont stockés dans le localStorage
- Expiration automatique après 24h
- Redirection automatique vers la page de connexion

## 📁 Structure du projet

```
eventspace-pro/
├── backend/                 # API Node.js
│   ├── config/             # Configuration DB
│   ├── controllers/        # Contrôleurs API
│   ├── middleware/         # Middleware (auth, upload)
│   ├── models/            # Modèles MongoDB
│   ├── routes/            # Routes API
│   └── uploads/           # Images uploadées
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   └── context/       # Context API
│   └── public/            # Fichiers statiques
└── package.json           # Scripts de démarrage
```

## 🧪 Tests API

Le projet inclut une collection Postman pour tester l'API :
- `EventSpace_API_Tests.postman_collection.json`
- Voir `GUIDE_POSTMAN.md` pour les instructions

## 🔧 Scripts disponibles

```bash
npm run dev          # Démarre backend + frontend
npm run server       # Démarre uniquement le backend
npm run client       # Démarre uniquement le frontend
npm run build        # Build de production
npm run install-all  # Installe toutes les dépendances
```

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -ano | findstr :5001
   netstat -ano | findstr :3000
   ```

2. **MongoDB non connecté**
   ```bash
   # Vérifier que MongoDB est démarré
   mongo --eval "db.runCommand('ping')"
   ```

3. **Erreurs CORS**
   - Vérifier que le frontend est sur le port 3000
   - Vérifier la configuration CORS dans `server.js`

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs dans la console
2. Consultez la documentation Postman
3. Vérifiez la connexion MongoDB

---

**Développé avec ❤️ par Mariam TIMITE** 