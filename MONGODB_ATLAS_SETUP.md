# ☁️ Configuration MongoDB Atlas - EventSpace Pro

## 🚀 Pourquoi utiliser MongoDB Atlas ?

- **Pas d'installation locale** : Pas besoin d'installer MongoDB
- **Accessible partout** : Accès à votre base de données depuis n'importe où
- **Sauvegarde automatique** : Vos données sont sauvegardées automatiquement
- **Gratuit** : Plan gratuit disponible (512MB de stockage)

## 📋 Étapes de configuration

### 1. Créer un compte MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Cliquez sur "Try Free"
3. Créez un compte ou connectez-vous

### 2. Créer un cluster

1. Cliquez sur "Build a Database"
2. Choisissez "FREE" (M0)
3. Sélectionnez un provider (AWS, Google Cloud, Azure)
4. Choisissez une région proche de vous
5. Cliquez sur "Create"

### 3. Configurer la sécurité

#### Créer un utilisateur de base de données
1. Dans "Database Access", cliquez sur "Add New Database User"
2. Username: `eventspace_user`
3. Password: `votre_mot_de_passe_securise`
4. Role: "Read and write to any database"
5. Cliquez sur "Add User"

#### Configurer l'accès réseau
1. Dans "Network Access", cliquez sur "Add IP Address"
2. Pour le développement : cliquez sur "Allow Access from Anywhere" (0.0.0.0/0)
3. Pour la production : ajoutez votre IP spécifique
4. Cliquez sur "Confirm"

### 4. Obtenir l'URI de connexion

1. Dans "Database", cliquez sur "Connect"
2. Choisissez "Connect your application"
3. Copiez l'URI de connexion

### 5. Configurer l'application

Modifiez le fichier `backend/.env` :

```env
# Configuration du serveur
PORT=5001

# Configuration JWT
JWT_SECRET=mon_secret_jwt_super_securise_2024_eventspace_pro

# Configuration MongoDB Atlas
MONGODB_URI=mongodb+srv://eventspace_user:votre_mot_de_passe_securise@cluster0.xxxxx.mongodb.net/eventspace?retryWrites=true&w=majority

# Configuration des uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```

**⚠️ Important** : Remplacez `votre_mot_de_passe_securise` par le mot de passe que vous avez créé.

## 🔧 Test de connexion

Après avoir configuré MongoDB Atlas :

```bash
# Tester la connexion
npm run test-mongo

# Ou démarrer l'application
npm run dev
```

## 📊 Monitoring

Dans MongoDB Atlas, vous pouvez :
- Voir les statistiques de votre base de données
- Surveiller les performances
- Consulter les logs
- Gérer les sauvegardes

## 🔒 Sécurité

### Bonnes pratiques
- Utilisez des mots de passe forts
- Limitez l'accès réseau à vos IPs
- Activez l'authentification à deux facteurs
- Surveillez régulièrement les accès

### Variables d'environnement
- Ne committez jamais le fichier `.env` dans Git
- Utilisez des variables d'environnement différentes pour dev/prod
- Changez régulièrement les mots de passe

## 🆚 MongoDB Local vs Atlas

| Fonctionnalité | MongoDB Local | MongoDB Atlas |
|----------------|---------------|---------------|
| Installation | Requise | Aucune |
| Maintenance | Manuelle | Automatique |
| Sauvegarde | Manuelle | Automatique |
| Coût | Gratuit | Gratuit (limité) |
| Performance | Dépend du hardware | Optimisée |
| Accessibilité | Local uniquement | Partout |

## 🚨 Dépannage

### Erreur : "Authentication failed"
- Vérifiez le nom d'utilisateur et mot de passe
- Assurez-vous que l'utilisateur a les bonnes permissions

### Erreur : "Network timeout"
- Vérifiez votre connexion internet
- Vérifiez les règles d'accès réseau dans Atlas

### Erreur : "Connection refused"
- Vérifiez l'URI de connexion
- Assurez-vous que le cluster est actif

## 📞 Support MongoDB Atlas

- [Documentation officielle](https://docs.atlas.mongodb.com/)
- [Forum communautaire](https://developer.mongodb.com/community/forums/)
- [Support technique](https://www.mongodb.com/support)

---

**☁️ Votre base de données cloud est prête !** 