const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🛡️ Middleware pour vérifier le token JWT
const auth = async (req, res, next) => {
  try {
    // 🔍 Récupérer le token depuis le header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès refusé. Header Authorization manquant.' 
      });
    }

    // 🔍 Vérifier le format "Bearer TOKEN"
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Format de token invalide. Utilisez: Bearer TOKEN' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès refusé. Token manquant.' 
      });
    }

    console.log('🔐 Vérification du token JWT...');

    // 🔐 Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide. userId manquant.' 
      });
    }

    // 👤 Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide. Utilisateur non trouvé.' 
      });
    }

    console.log('✅ Token valide pour l\'utilisateur:', user.email);

    // ✅ Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;
    
    next();
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du token:', error.message);
    
    // 🚨 Gestion des erreurs JWT spécifiques
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token JWT invalide.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expiré. Veuillez vous reconnecter.' 
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token pas encore valide.' 
      });
    }

    // 🚨 Autres erreurs (DB, etc.)
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la vérification du token.' 
    });
  }
};

// 🛡️ Middleware pour vérifier si l'utilisateur est admin
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentification requise.' 
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès refusé. Droits administrateur requis.' 
    });
  }

  console.log('✅ Accès admin autorisé pour:', req.user.email);
  next();
};

// 🛡️ Middleware optionnel (n'échoue pas si pas de token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Pas de token, mais on continue
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Pas de token, mais on continue
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = user;
      req.token = token;
    }
    
    next();
    
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
    next();
  }
};


module.exports = { 
  auth, 
  adminAuth, 
  optionalAuth 
};