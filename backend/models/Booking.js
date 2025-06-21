const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'L\'espace est requis']
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  startTime: {
    type: String,
    required: [true, 'L\'heure de début est requise'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'L\'heure de fin est requise'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)']
  },
  numberOfPeople: {
    type: Number,
    required: [true, 'Le nombre de personnes est requis'],
    min: [1, 'Le nombre de personnes doit être d\'au moins 1']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Le prix total est requis'],
    min: [0, 'Le prix total ne peut pas être négatif']
  },
  status: {
    type: String,
    enum: {
      values: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'],
      message: 'Le statut doit être PENDING, CONFIRMED, CANCELLED, COMPLETED ou REJECTED'
    },
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      message: 'Le statut de paiement doit être PENDING, PAID, FAILED ou REFUNDED'
    },
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER'],
      message: 'La méthode de paiement doit être CASH, CARD, MOBILE_MONEY ou BANK_TRANSFER'
    }
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Les demandes spéciales ne peuvent pas dépasser 500 caractères']
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'La raison d\'annulation ne peut pas dépasser 200 caractères']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: [1000, 'L\'avis ne peut pas dépasser 1000 caractères']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔗 Virtual pour la durée en heures
bookingSchema.virtual('durationHours').get(function() {
  const start = new Date(`${this.startDate.toDateString()} ${this.startTime}`);
  const end = new Date(`${this.endDate.toDateString()} ${this.endTime}`);
  return Math.ceil((end - start) / (1000 * 60 * 60));
});

// 🔗 Virtual pour la durée en jours
bookingSchema.virtual('durationDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// 🔗 Virtual pour le statut formaté
bookingSchema.virtual('statusFormatted').get(function() {
  const statusMap = {
    'PENDING': 'En attente',
    'CONFIRMED': 'Confirmée',
    'CANCELLED': 'Annulée',
    'COMPLETED': 'Terminée',
    'REJECTED': 'Rejetée'
  };
  return statusMap[this.status] || this.status;
});

// 🔗 Virtual pour le statut de paiement formaté
bookingSchema.virtual('paymentStatusFormatted').get(function() {
  const statusMap = {
    'PENDING': 'En attente',
    'PAID': 'Payé',
    'FAILED': 'Échoué',
    'REFUNDED': 'Remboursé'
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// 📊 Index pour améliorer les performances
bookingSchema.index({ user: 1 });
bookingSchema.index({ space: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ startDate: 1 });
bookingSchema.index({ endDate: 1 });
bookingSchema.index({ createdAt: -1 });

// 🛡️ Middleware pour logs
bookingSchema.post('save', function(doc) {
  console.log('✅ Réservation sauvegardée:', doc._id);
});

bookingSchema.post('remove', function(doc) {
  console.log('🗑️ Réservation supprimée:', doc._id);
});

// 🎯 Méthode pour vérifier les conflits de réservation
bookingSchema.statics.checkConflicts = async function(spaceId, startDate, endDate, startTime, endTime, excludeBookingId = null) {
  const query = {
    space: spaceId,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    $or: [
      // Vérifier si la nouvelle réservation chevauche une réservation existante
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await this.find(query);
  
  // Vérifier les conflits d'heures pour les réservations du même jour
  const timeConflicts = conflictingBookings.filter(booking => {
    if (booking.startDate.toDateString() === startDate.toDateString()) {
      const newStart = startTime;
      const newEnd = endTime;
      const existingStart = booking.startTime;
      const existingEnd = booking.endTime;
      
      return (newStart < existingEnd && newEnd > existingStart);
    }
    return false;
  });

  return timeConflicts.length > 0;
};

// 🎯 Méthode pour calculer le prix total
bookingSchema.statics.calculatePrice = async function(spaceId, startDate, endDate, startTime, endTime) {
  const Space = mongoose.model('Space');
  const space = await Space.findById(spaceId);
  
  if (!space) {
    throw new Error('Espace non trouvé');
  }

  const start = new Date(`${startDate.toDateString()} ${startTime}`);
  const end = new Date(`${endDate.toDateString()} ${endTime}`);
  const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
  const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  let totalPrice = 0;

  switch (space.priceType) {
    case 'HEURE':
      totalPrice = space.price * durationHours;
      break;
    case 'JOUR':
      totalPrice = space.price * durationDays;
      break;
    case 'SEMAINE':
      totalPrice = space.price * Math.ceil(durationDays / 7);
      break;
    case 'MOIS':
      totalPrice = space.price * Math.ceil(durationDays / 30);
      break;
    default:
      totalPrice = space.price;
  }

  return totalPrice;
};

// 🎯 Méthode pour obtenir les infos publiques
bookingSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    user: this.user,
    space: this.space,
    startDate: this.startDate,
    endDate: this.endDate,
    startTime: this.startTime,
    endTime: this.endTime,
    numberOfPeople: this.numberOfPeople,
    totalPrice: this.totalPrice,
    status: this.status,
    statusFormatted: this.statusFormatted,
    paymentStatus: this.paymentStatus,
    paymentStatusFormatted: this.paymentStatusFormatted,
    paymentMethod: this.paymentMethod,
    specialRequests: this.specialRequests,
    durationHours: this.durationHours,
    durationDays: this.durationDays,
    rating: this.rating,
    review: this.review,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Booking', bookingSchema); 