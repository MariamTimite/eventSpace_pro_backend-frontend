# 🚀 Guide Complet Postman - EventSpace Pro API

## 📋 Prérequis

### 1. Vérifier que le serveur fonctionne
```bash
# Dans votre terminal, assurez-vous que le serveur tourne
npm start
# ou
npm run dev
```

### 2. Vérifier le port
- Votre serveur doit tourner sur le port **5001**
- Si vous avez des erreurs de port, changez dans votre fichier `.env` :
```
PORT=5001
JWT_SECRET=votre_secret_jwt
MONGODB_URI=votre_uri_mongodb
```

## 🔧 Configuration Postman

### 1. Importer la Collection
1. Ouvrez Postman
2. Cliquez sur "Import"
3. Sélectionnez le fichier `EventSpace_API_Tests.postman_collection.json`
4. La collection sera importée avec toutes les requêtes préconfigurées

### 2. Configuration des Variables
1. Cliquez sur la collection "EventSpace Pro API"
2. Allez dans l'onglet "Variables"
3. Vérifiez que `baseUrl` est défini sur `http://localhost:5001`

## 🚨 Problèmes Courants et Solutions

### ❌ Erreur "Invalid character in header content ['Authorization']"

**Cause :** Format incorrect du header Authorization

**Solution :**
1. **NE PAS** écrire manuellement dans l'onglet "Headers"
2. Utilisez l'onglet **"Authorization"** dans Postman :
   - Type : `Bearer Token`
   - Token : Collez votre token JWT

**Méthode Correcte :**
```
1. Cliquez sur l'onglet "Authorization"
2. Sélectionnez "Bearer Token" dans le dropdown
3. Collez votre token dans le champ "Token"
4. Postman ajoutera automatiquement le header "Authorization: Bearer YOUR_TOKEN"
```

### ❌ Erreur "EADDRINUSE: address already in use"

**Cause :** Le port est déjà utilisé

**Solution :**
```bash
# 1. Trouver le processus qui utilise le port
netstat -ano | findstr :5001

# 2. Tuer le processus (remplacez PID par le numéro trouvé)
taskkill /PID PID /F

# 3. Ou changer le port dans .env
PORT=5002
```

### ❌ Erreur "Cannot read property 'map' of undefined"

**Cause :** Problème avec les fichiers uploadés

**Solution :**
1. Pour les requêtes avec images, utilisez `form-data`
2. Assurez-vous que le dossier `uploads/` existe
3. Vérifiez les permissions du dossier

### ❌ Erreur "JWT_SECRET is not defined"

**Cause :** Variable d'environnement manquante

**Solution :**
Créez ou modifiez votre fichier `.env` :
```env
PORT=5001
JWT_SECRET=mon_secret_jwt_super_securise_2024
MONGODB_URI=mongodb://localhost:27017/eventspace
```

## 📝 Guide de Test Étape par Étape

### Étape 1 : Test de Base
1. Lancez le test "Test de Connexion API"
2. Vous devriez recevoir : `{"message": "EventSpace Pro API is running!"}`

### Étape 2 : Authentification
1. **Inscription** : Lancez "1. Inscription Utilisateur"
   - Le token sera automatiquement sauvegardé
2. **Connexion** : Lancez "2. Connexion Utilisateur"
   - Le token sera mis à jour
3. **Profil** : Lancez "3. Profil Utilisateur"
   - Vérifiez que vous recevez les infos utilisateur

### Étape 3 : Espaces
1. **Créer un espace** : Lancez "1. Créer un Espace"
   - Pour les images, cliquez sur "Select Files" dans form-data
   - L'ID de l'espace sera sauvegardé automatiquement
2. **Lister les espaces** : Lancez "2. Lister tous les Espaces"
3. **Obtenir un espace** : Lancez "3. Obtenir un Espace par ID"

### Étape 4 : Réservations
1. **Créer une réservation** : Lancez "1. Créer une Réservation"
   - L'ID de la réservation sera sauvegardé
2. **Lister les réservations** : Lancez "2. Lister les Réservations"
3. **Gérer le statut** : Lancez "4. Mettre à jour le Statut"

## 🔍 Debug et Vérifications

### Vérifier les Variables de Collection
1. Cliquez sur la collection
2. Onglet "Variables"
3. Vérifiez que `authToken`, `spaceId`, `bookingId` sont définis

### Vérifier les Headers
1. Dans chaque requête, vérifiez l'onglet "Headers"
2. Pour les requêtes authentifiées, vérifiez l'onglet "Authorization"
3. Pour les uploads, vérifiez que c'est en `form-data`

### Vérifier le Body
1. **JSON** : Utilisez l'onglet "Body" → "raw" → "JSON"
2. **Form-data** : Utilisez l'onglet "Body" → "form-data"
3. **Fichiers** : Dans form-data, sélectionnez "File" comme type

## 📊 Exemples de Réponses Attendues

### Inscription Réussie (201)
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+33123456789",
    "role": "USER"
  }
}
```

### Connexion Réussie (200)
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+33123456789",
    "role": "USER"
  }
}
```

### Espace Créé (201)
```json
{
  "success": true,
  "message": "Espace créé avec succès",
  "space": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Salle de Conférence Moderne",
    "description": "Une salle de conférence moderne...",
    "type": "CONFERENCE_ROOM",
    "capacity": 50,
    "price": 150,
    "priceType": "PER_HOUR",
    "images": ["uploads/image1.jpg"],
    "isAvailable": true
  }
}
```

## 🆘 Dépannage Avancé

### Problème de CORS
Si vous avez des erreurs CORS :
```javascript
// Dans server.js, vérifiez que CORS est configuré
app.use(cors({
  origin: '*',
  credentials: true
}));
```

### Problème de Base de Données
Vérifiez votre connexion MongoDB :
```javascript
// Dans config/db.js
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### Problème de Token Expiré
Si vous avez "Token expiré" :
1. Relancez la connexion
2. Récupérez un nouveau token
3. Mettez à jour la variable `authToken`

## 📞 Support

Si vous avez encore des problèmes :
1. Vérifiez les logs du serveur dans votre terminal
2. Vérifiez la console Postman (View → Show Postman Console)
3. Vérifiez que tous les fichiers de routes existent
4. Vérifiez que MongoDB est connecté

---

**💡 Conseil :** Testez toujours dans l'ordre : Base → Auth → Espaces → Réservations 