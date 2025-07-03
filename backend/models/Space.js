const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'espace est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  type: {
    type: String,
    enum: {
      values: ['BUREAU', 'SALLE_REUNION', 'SALLE_CONFERENCE', 'ESPACE_COWORKING', 'SALLE_FORMATION'],
      message: 'Le type doit être BUREAU, SALLE_REUNION, SALLE_CONFERENCE, ESPACE_COWORKING ou SALLE_FORMATION'
    },
    required: [true, 'Le type d\'espace est requis']
  },
  capacity: {
    type: Number,
    required: [true, 'La capacité est requise'],
    min: [1, 'La capacité doit être d\'au moins 1 personne'],
    max: [100, 'La capacité ne peut pas dépasser 100 personnes']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  priceType: {
    type: String,
    enum: {
      values: ['HEURE', 'JOUR', 'SEMAINE', 'MOIS'],
      message: 'Le type de prix doit être HEURE, JOUR, SEMAINE ou MOIS'
    },
    required: [true, 'Le type de prix est requis']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    required: [true, 'Au moins une image est requise']
  }],
  address: {
    street: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Côte d\'Ivoire',
      trim: true
    }
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'La latitude est requise']
    },
    longitude: {
      type: Number,
      required: [true, 'La longitude est requise']
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le propriétaire est requis']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔗 Virtual pour l'adresse complète
spaceSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.country}`;
});

// 🔗 Virtual pour le prix formaté
spaceSchema.virtual('formattedPrice').get(function() {
  return this.priceType ? `${this.price} FCFA/${this.priceType.toLowerCase()}` : `${this.price} FCFA`;
});

// 🔗 Virtual pour les réservations
spaceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'space'
});

// 📊 Index pour améliorer les performances
spaceSchema.index({ owner: 1 });
spaceSchema.index({ type: 1 });
spaceSchema.index({ isAvailable: 1 });
spaceSchema.index({ 'address.city': 1 });
spaceSchema.index({ price: 1 });
spaceSchema.index({ rating: 1 });
spaceSchema.index({ 
  coordinates: '2dsphere' 
}); // Index géospatial pour les recherches de proximité

// 🛡️ Middleware pour logs
spaceSchema.post('save', function(doc) {
  console.log('✅ Espace sauvegardé:', doc.name);
});

spaceSchema.post('remove', function(doc) {
  console.log('🗑️ Espace supprimé:', doc.name);
});

// 🎯 Méthode pour mettre à jour la note moyenne
spaceSchema.methods.updateRating = async function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return await this.save();
};

// 🎯 Méthode pour obtenir les infos publiques
spaceSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    type: this.type,
    capacity: this.capacity,
    price: this.price,
    priceType: this.priceType,
    formattedPrice: this.formattedPrice,
    amenities: this.amenities,
    images: this.images,
    address: this.address,
    fullAddress: this.fullAddress,
    coordinates: this.coordinates,
    isAvailable: this.isAvailable,
    rating: this.rating,
    openingHours: this.openingHours,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Space', spaceSchema); 