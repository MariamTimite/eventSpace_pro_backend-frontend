# EventSpace Pro - Guide de Déploiement

## 🚀 Déploiement sur Render (Backend) et Netlify (Frontend)

### Prérequis
- Compte GitHub
- Compte Render (gratuit)
- Compte Netlify (gratuit)
- MongoDB Atlas (déjà configuré)

## 📋 Étapes de déploiement

### 1. Backend sur Render

1. **Connecter le repository GitHub à Render**
   - Aller sur [render.com](https://render.com)
   - Créer un compte ou se connecter
   - Cliquer sur "New +" → "Web Service"
   - Connecter le repository GitHub

2. **Configuration du service**
   - **Name**: `eventspace-pro-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

3. **Variables d'environnement à configurer**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventspace-pro-db
   JWT_SECRET=your-super-secret-jwt-key-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Déployer**
   - Cliquer sur "Create Web Service"
   - Attendre le déploiement (5-10 minutes)
   - Noter l'URL générée (ex: `https://eventspace-pro-backend.onrender.com`)

### 2. Frontend sur Netlify

1. **Connecter le repository GitHub à Netlify**
   - Aller sur [netlify.com](https://netlify.com)
   - Créer un compte ou se connecter
   - Cliquer sur "New site from Git"
   - Connecter le repository GitHub

2. **Configuration du build**
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `18`

3. **Variables d'environnement**
   ```
   NODE_ENV=production
   VITE_API_URL=https://eventspace-pro-backend.onrender.com/api
   ```

4. **Déployer**
   - Cliquer sur "Deploy site"
   - Attendre le déploiement (3-5 minutes)
   - Noter l'URL générée (ex: `https://eventspace-pro.netlify.app`)

### 3. Mise à jour des URLs

Après le déploiement, mettre à jour :

1. **Dans Render (Backend)**:
   - Aller dans les settings du service
   - Mettre à jour les variables d'environnement CORS avec l'URL Netlify

2. **Dans Netlify (Frontend)**:
   - Aller dans Site settings → Environment variables
   - Vérifier que `VITE_API_URL` pointe vers l'URL Render

## 🔧 URLs de test

- **Backend**: `https://eventspace-pro-backend.onrender.com`
- **Frontend**: `https://eventspace-pro.netlify.app`
- **Health Check**: `https://eventspace-pro-backend.onrender.com/api/health`

## 📱 Identifiants de test

- **Email**: `admin@eventspace.com`
- **Mot de passe**: `admin123456`

## 🐛 Dépannage

### Problèmes courants

1. **CORS Error**
   - Vérifier que l'URL frontend est dans les origines autorisées du backend

2. **Build Error**
   - Vérifier que toutes les dépendances sont dans `package.json`
   - Vérifier la version de Node.js

3. **Database Connection**
   - Vérifier l'URI MongoDB Atlas
   - Vérifier les permissions de la base de données

### Logs

- **Render**: Dashboard → Service → Logs
- **Netlify**: Site → Functions → Logs

## 📞 Support

En cas de problème, vérifier :
1. Les logs de déploiement
2. Les variables d'environnement
3. La connectivité réseau
4. Les permissions MongoDB Atlas
