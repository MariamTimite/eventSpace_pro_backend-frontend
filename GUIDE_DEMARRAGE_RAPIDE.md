# 🚀 Guide de Démarrage Rapide - EventSpace Pro

## ⚡ Démarrage en 3 étapes

### 1. Préparation
```bash
# Cloner le projet (si pas déjà fait)
git clone <votre-repo>
cd eventspace-pro

# Configuration automatique
npm run setup
```

### 2. Installation des dépendances
```bash
# Installer toutes les dépendances
npm run install-all
```

### 3. Démarrage de l'application
```bash
# Démarrer MongoDB (dans un nouveau terminal)
mongod

# Démarrer l'application (dans le terminal principal)
npm run dev
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001
- **Test de connexion** : http://localhost:3000/test

## 📱 Fonctionnalités principales

### 👤 Authentification
- **Inscription** : Créez un compte utilisateur
- **Connexion** : Accédez à votre espace personnel
- **Profil** : Gérez vos informations personnelles

### 🏢 Gestion des espaces
- **Recherche** : Trouvez des espaces par type, localisation, prix
- **Détails** : Consultez les informations complètes des espaces
- **Réservation** : Réservez des espaces pour vos événements

### 📅 Système de réservation
- **Création** : Créez des réservations avec dates et heures
- **Gestion** : Consultez et modifiez vos réservations
- **Statuts** : Suivez l'état de vos réservations

### 👨‍💼 Interface Admin
- **Dashboard** : Vue d'ensemble des utilisateurs et espaces
- **Gestion** : Gérez les utilisateurs et espaces
- **Statistiques** : Consultez les données d'utilisation

## 🔧 Scripts utiles

```bash
npm run setup          # Configuration automatique
npm run install-all    # Installation des dépendances
npm run dev           # Démarrage complet (frontend + backend)
npm run server        # Démarrage backend uniquement
npm run client        # Démarrage frontend uniquement
npm run test-mongo    # Test de connexion MongoDB
```

## 🐛 Dépannage rapide

### Problème : MongoDB non connecté
```bash
# Vérifier que MongoDB est démarré
mongod

# Ou utiliser MongoDB Atlas (cloud)
# Modifier MONGODB_URI dans backend/.env
```

### Problème : Ports déjà utilisés
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :5001
netstat -ano | findstr :3000

# Tuer les processus si nécessaire
taskkill /PID <PID> /F
```

### Problème : Erreurs CORS
- Vérifiez que le frontend est sur le port 3000
- Vérifiez que le backend est sur le port 5001
- Vérifiez la configuration CORS dans `server.js`

## 📊 Structure des données

### Collections MongoDB
- **users** : Utilisateurs et administrateurs
- **spaces** : Espaces événementiels
- **bookings** : Réservations

### Types d'espaces
- `BUREAU` : Bureaux individuels
- `SALLE_REUNION` : Salles de réunion
- `SALLE_CONFERENCE` : Salles de conférence
- `ESPACE_COWORKING` : Espaces de coworking
- `SALLE_FORMATION` : Salles de formation

### Statuts de réservation
- `PENDING` : En attente
- `CONFIRMED` : Confirmée
- `CANCELLED` : Annulée
- `COMPLETED` : Terminée
- `REJECTED` : Rejetée

## 🔐 Rôles utilisateurs

- **USER** : Utilisateur standard (réservations, consultation)
- **ADMIN** : Administrateur (gestion complète)

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans la console
2. Consultez la page de test : http://localhost:3000/test
3. Vérifiez la documentation Postman
4. Vérifiez la connexion MongoDB

---

**🎉 Votre application EventSpace Pro est prête !** 