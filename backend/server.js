const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express();

// Configuration CORS pour permettre la communication avec le frontend
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://eventspace-pro.netlify.app',
      'https://eventspace-pro-frontend.netlify.app',
      'https://your-netlify-domain.netlify.app'
    ]
  : [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002', 
      'http://127.0.0.1:3000', 
      'http://127.0.0.1:3001', 
      'http://127.0.0.1:3002'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'EventSpace Pro API is running!' });
});

// Route de test pour vérifier la connexion
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EventSpace Pro API is healthy!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug: Chargement des routes auth
console.log('🔄 Tentative de chargement des routes auth...');
try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Routes auth chargées:', typeof authRoutes);
  app.use('/api/auth', authRoutes);
  console.log('✅ Routes auth montées sur /api/auth');
} catch (error) {
  console.error('❌ Erreur chargement routes auth:', error.message);
}

// Debug: Chargement des routes spaces
console.log('🔄 Tentative de chargement des routes spaces...');
try {
  const spacesRoutes = require('./routes/spaces');
  console.log('✅ Routes spaces chargées:', typeof spacesRoutes);
  app.use('/api/spaces', spacesRoutes);
  console.log('✅ Routes spaces montées sur /api/spaces');
} catch (error) {
  console.error('❌ Erreur chargement routes spaces:', error.message);
}

// Debug: Chargement des routes bookings
console.log('🔄 Tentative de chargement des routes bookings...');
try {
  const bookingsRoutes = require('./routes/bookings');
  console.log('✅ Routes bookings chargées:', typeof bookingsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  console.log('✅ Routes bookings montées sur /api/bookings');
} catch (error) {
  console.error('❌ Erreur chargement routes bookings:', error.message);
}

// Debug: Chargement des routes de test
console.log('🔄 Tentative de chargement des routes de test...');
try {
  const testRoutes = require('./routes/test');
  console.log('✅ Routes de test chargées:', typeof testRoutes);
  app.use('/api/test', testRoutes);
  console.log('✅ Routes de test montées sur /api/test');
} catch (error) {
  console.error('❌ Erreur chargement routes de test:', error.message);
}

// Debug: Chargement des routes users
console.log('🔄 Tentative de chargement des routes users...');
try {
  const usersRoutes = require('./routes/users');
  console.log('✅ Routes users chargées:', typeof usersRoutes);
  app.use('/api/users', usersRoutes);
  console.log('✅ Routes users montées sur /api/users');
} catch (error) {
  console.error('❌ Erreur chargement routes users:', error.message);
}

// Debug: Chargement des routes stats
console.log('🔄 Tentative de chargement des routes stats...');
try {
  const statsRoutes = require('./routes/stats');
  console.log('✅ Routes stats chargées:', typeof statsRoutes);
  app.use('/api/stats', statsRoutes);
  console.log('✅ Routes stats montées sur /api/stats');
} catch (error) {
  console.error('❌ Erreur chargement routes stats:', error.message);
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours sur le port ${PORT}`);
});