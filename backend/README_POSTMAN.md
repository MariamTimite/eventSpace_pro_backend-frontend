# 🚀 Guide de Résolution de test API sur postman

### ✅ Solution Rapide

1. **Téléchargez la collection Postman** : `EventSpace_API_Tests.postman_collection.json`
2. **Importez-la dans Postman**
3. **Suivez le guide étape par étape** ci-dessous

---

### 1. Vérification du Serveur

```bash
# Assurez-vous que votre serveur fonctionne
npm start
```

Vous devriez voir : `🚀 Serveur en cours sur le port 5001`

### 2. Test Automatique

```bash
# Lancez le script de test automatique
node test-api.js
```

Ce script vérifiera automatiquement :
- ✅ Connexion API
- ✅ Inscription utilisateur
- ✅ Authentification
- ✅ Récupération profil
- ✅ Liste des espaces

### 3. Configuration Postman

#### A. Importer la Collection
1. Ouvrez Postman
2. Cliquez sur **"Import"**
3. Sélectionnez `EventSpace_API_Tests.postman_collection.json`
4. Cliquez sur **"Import"**

#### B. Vérifier les Variables
1. Cliquez sur la collection **"EventSpace Pro API"**
2. Onglet **"Variables"**
3. Vérifiez que `baseUrl = http://localhost:5001`

---

## 🚨 Problèmes Courants et Solutions

### ❌ Erreur "Invalid character in header content ['Authorization']"

**PROBLÈME :** Vous écrivez manuellement le header Authorization

**SOLUTION :**
1. **NE PAS** utiliser l'onglet "Headers"
2. Utilisez l'onglet **"Authorization"** :
   - Type : `Bearer Token`
   - Token : Collez votre token JWT

### ❌ Erreur "EADDRINUSE: address already in use"

**PROBLÈME :** Le port 5001 est déjà utilisé

**SOLUTION :**
```bash
# Trouver le processus
netstat -ano | findstr :5001

# Tuer le processus (remplacez PID)
taskkill /PID PID /F

# Ou changer le port dans .env
PORT=5002
```

### ❌ Erreur "JWT_SECRET is not defined"

**PROBLÈME :** Variables d'environnement manquantes

**SOLUTION :**
Créez un fichier `.env` :
```env
PORT=5001
JWT_SECRET=mon_secret_jwt_super_securise_2024
MONGODB_URI=mongodb://localhost:27017/eventspace
```

---

## 📝 Guide de Test Étape par Étape

### Étape 1 : Test de Base
1. Lancez **"Test de Connexion API"**
2. Réponse attendue : `{"message": "EventSpace Pro API is running!"}`

### Étape 2 : Authentification
1. **Inscription** : Lancez **"1. Inscription Utilisateur"**
   - Le token sera automatiquement sauvegardé
2. **Connexion** : Lancez **"2. Connexion Utilisateur"**
   - Le token sera mis à jour
3. **Profil** : Lancez **"3. Profil Utilisateur"**

### Étape 3 : Espaces
1. **Créer un espace** : Lancez **"1. Créer un Espace"**
   - Pour les images : cliquez sur "Select Files" dans form-data
2. **Lister les espaces** : Lancez **"2. Lister tous les Espaces"**
3. **Obtenir un espace** : Lancez **"3. Obtenir un Espace par ID"**

### Étape 4 : Réservations
1. **Créer une réservation** : Lancez **"1. Créer une Réservation"**
2. **Lister les réservations** : Lancez **"2. Lister les Réservations"**
3. **Gérer le statut** : Lancez **"4. Mettre à jour le Statut"**

---

## 🔧 Configuration Avancée

### Headers Corrects

#### Pour les requêtes JSON :
```
Content-Type: application/json
```

#### Pour les requêtes authentifiées :
```
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Pour les uploads (form-data) :
```
Content-Type: multipart/form-data
```

### Body Corrects

#### JSON (inscription, connexion, etc.) :
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "123456",
  "phone": "+33123456789"
}
```

#### Form-data (création d'espace avec images) :
- `name`: Salle de Conférence Moderne
- `description`: Description de l'espace
- `type`: CONFERENCE_ROOM
- `capacity`: 50
- `price`: 150.00
- `priceType`: PER_HOUR
- `amenities`: ["WiFi", "Projecteur", "Tableau blanc"]
- `address`: {"street": "123 Rue de la Paix", "city": "Paris"}
- `coordinates`: {"latitude": 48.8566, "longitude": 2.3522}
- `images`: [Sélectionnez vos fichiers]

---

## 📊 Réponses Attendues

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
    "email": "john.doe@example.com"
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
    "email": "john.doe@example.com"
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
    "type": "CONFERENCE_ROOM",
    "capacity": 50,
    "price": 150,
    "isAvailable": true
  }
}
```

---

## 🆘 Dépannage

### Vérifications à Faire

1. **Serveur fonctionne-t-il ?**
   ```bash
   npm start
   ```

2. **MongoDB est-il connecté ?**
   Vérifiez les logs du serveur

3. **Variables d'environnement ?**
   Vérifiez votre fichier `.env`

4. **Port disponible ?**
   ```bash
   netstat -ano | findstr :5001
   ```

### Debug Postman

1. **Console Postman** : View → Show Postman Console
2. **Variables** : Vérifiez les variables de collection
3. **Headers** : Vérifiez l'onglet Authorization
4. **Body** : Vérifiez le format (JSON vs form-data)

---

## 📞 Support

Si vous avez encore des problèmes :

1. **Lancez le test automatique** : `node test-api.js`
2. **Vérifiez les logs du serveur**
3. **Vérifiez la console Postman**
4. **Partagez les messages d'erreur exacts**

---

## 🎉 Fichiers Fournis

- ✅ `EventSpace_API_Tests.postman_collection.json` - Collection Postman complète
- ✅ `GUIDE_POSTMAN.md` - Guide détaillé
- ✅ `test-api.js` - Script de test automatique
- ✅ `env.example` - Exemple de configuration
