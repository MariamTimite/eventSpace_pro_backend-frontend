const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez entrer un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Par défaut, ne pas inclure le password dans les requêtes
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        // Validation basique pour numéros ivoiriens et internationaux
        return /^(\+225|0)[0-9\s-]{8,}$/.test(v);
      },
      message: 'Veuillez entrer un numéro de téléphone valide'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['USER', 'ADMIN'],
      message: 'Le rôle doit être USER ou ADMIN'
    },
    default: 'USER'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profilePicture: {
    type: String,
    default: null
  }
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password; // Ne jamais retourner le password en JSON
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// 🔗 Virtual pour le nom complet
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 🔐 Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Si le mot de passe n'est pas modifié, passer au suivant
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    console.log('🔐 Hashage du mot de passe pour:', this.email);
    
    // Hash du mot de passe avec un salt de 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    console.error('❌ Erreur lors du hashage:', error);
    next(error);
  }
});

// 🔐 Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Le password doit être sélectionné explicitement pour cette comparaison
    if (!this.password) {
      throw new Error('Le mot de passe n\'est pas disponible pour la comparaison');
    }
    
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Erreur lors de la comparaison des mots de passe:', error);
    throw error;
  }
};

// 👤 Méthode pour obtenir les infos publiques de l'utilisateur
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    profilePicture: this.profilePicture,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLogin: this.lastLogin
  };
};

// 🎯 Méthode pour mettre à jour la dernière connexion
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// 📊 Index pour améliorer les performances
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// 🛡️ Middleware pour logs de sécurité
userSchema.post('save', function(doc) {
  console.log('✅ Utilisateur sauvegardé:', doc.email);
});

userSchema.post('remove', function(doc) {
  console.log('🗑️ Utilisateur supprimé:', doc.email);
});

module.exports = mongoose.model('User', userSchema);
