const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token valide 7 jours
  });
};

// @route   POST /api/auth/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (firstName, lastName, email, password, phone)'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez entrer un email valide'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: phone.trim()
    });

    const savedUser = await user.save();
    if (!savedUser) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'enregistrement de l\'utilisateur'
      });
    }

    const token = generateToken(savedUser._id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      token,
      user: savedUser.getPublicProfile()
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});


// @route   POST /api/auth/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post('/login', async (req, res) => {
  console.log("Tentative de login avec :", req.body);
  try {
    const { email, password } = req.body;

    // 🔍 Vérification des champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // 🔎 Recherche de l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log("Utilisateur trouvé ?", user);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 🔐 Comparaison des mots de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 📅 Mise à jour de la dernière connexion
    await user.updateLastLogin();

    // 🎫 Génération du token JWT
    const token = generateToken(user._id);

    // ✅ Réponse avec infos utilisateur (sans mot de passe)
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


// @route   GET /api/auth/profile
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private (nécessite un token)
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('👤 Récupération du profil pour l\'utilisateur:', req.user.email);
    
    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Vérifier si un token est valide
// @access  Private
router.post('/verify-token', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Token valide',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;