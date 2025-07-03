const express = require('express');
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Créer une nouvelle réservation
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      spaceId,
      startDate,
      endDate,
      startTime,
      endTime,
      numberOfPeople,
      specialRequests,
      paymentMethod
    } = req.body;

    // Validation des champs requis
    if (!spaceId || !startDate || !endDate || !startTime || !endTime || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être fournis'
      });
    }

    // Vérifier que l'espace existe et est disponible
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Espace non trouvé'
      });
    }

    if (!space.isAvailable || !space.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cet espace n\'est pas disponible'
      });
    }

    // Vérifier la capacité
    if (numberOfPeople > space.capacity) {
      return res.status(400).json({
        success: false,
        message: `Le nombre de personnes (${numberOfPeople}) dépasse la capacité de l'espace (${space.capacity})`
      });
    }

    // Parser les dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Validation des dates
    if (parsedStartDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La date de début ne peut pas être dans le passé'
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être après la date de début'
      });
    }

    // Vérifier les conflits de réservation
    const hasConflicts = await Booking.checkConflicts(
      spaceId,
      parsedStartDate,
      parsedEndDate,
      startTime,
      endTime
    );

    if (hasConflicts) {
      return res.status(409).json({
        success: false,
        message: 'Cet espace n\'est pas disponible pour les dates et heures sélectionnées'
      });
    }

    // Calculer le prix total
    const totalPrice = await Booking.calculatePrice(
      spaceId,
      parsedStartDate,
      parsedEndDate,
      startTime,
      endTime
    );

    const booking = new Booking({
      user: req.user._id,
      space: spaceId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      startTime,
      endTime,
      numberOfPeople,
      totalPrice,
      specialRequests,
      paymentMethod
    });

    const savedBooking = await booking.save();

    // Populate les références pour la réponse
    await savedBooking.populate('space');
    await savedBooking.populate('user', 'firstName lastName email');

    // Envoi d'un email de confirmation à l'utilisateur
    try {
      await emailService.sendBookingConfirmation({
        to: savedBooking.user.email,
        userName: savedBooking.user.firstName || savedBooking.user.lastName || savedBooking.user.email,
        spaceName: savedBooking.space.name,
        startDate: savedBooking.startDate,
        endDate: savedBooking.endDate,
        startTime: savedBooking.startTime,
        endTime: savedBooking.endTime,
        totalPrice: savedBooking.totalPrice
      });
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', err);
    }

    // Envoi d'un email de notification à l'admin
    try {
      await emailService.sendBookingNotificationToAdmin({
        to: process.env.ADMIN_EMAIL || 'admin@eventspace.com',
        userName: savedBooking.user.firstName || savedBooking.user.lastName || savedBooking.user.email,
        spaceName: savedBooking.space.name,
        startDate: savedBooking.startDate,
        endDate: savedBooking.endDate,
        startTime: savedBooking.startTime,
        endTime: savedBooking.endTime,
        totalPrice: savedBooking.totalPrice
      });
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email admin:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      booking: savedBooking.getPublicInfo()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la réservation:', error);

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
      message: 'Erreur serveur lors de la création de la réservation'
    });
  }
});

// @route   GET /api/bookings
// @desc    Récupérer les réservations de l'utilisateur
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      owner
    } = req.query;

    let filters = {};
    let isOwner = false;

    // Si admin, voir toutes les réservations
    if (req.user.role === 'ADMIN') {
      // pas de filtre user ni owner
    } else if (owner === 'true') {
      // Si ?owner=true, mode propriétaire
      isOwner = true;
    } else {
      // Sinon, utilisateur normal : ses propres réservations
      filters.user = req.user._id;
    }

    // Si mode propriétaire (ou admin qui veut voir les réservations de ses espaces)
    if (isOwner || req.user.role === 'ADMIN') {
      // Trouver les espaces dont il est propriétaire
      const Space = require('../models/Space');
      const ownedSpaces = await Space.find({ owner: req.user._id }).select('_id');
      const ownedSpaceIds = ownedSpaces.map(s => s._id);
      if (ownedSpaceIds.length > 0) {
        filters.space = { $in: ownedSpaceIds };
      } else {
        // Si aucun espace, retourner vide
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 1 }
        });
      }
    }

    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // DEBUG : log des filtres et de l'utilisateur
    console.log('DEBUG filters:', filters, 'user in req:', req.user._id, 'role:', req.user.role);

    const bookings = await Booking.find(filters)
      .populate('space', 'name type address images owner')
      .populate('user', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filters);

    // On filtre les réservations dont les références (space, user) n'existent plus
    const cleanBookings = bookings.filter(booking => booking.space && booking.user);

    res.json({
      success: true,
      data: cleanBookings, // On renvoie les données nettoyées
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: cleanBookings.length, // On ajuste le total
        pages: Math.ceil(cleanBookings.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur détaillée lors de la récupération des réservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Récupérer une réservation par ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('space', 'name type address images owner')
      .populate('user', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation ou le propriétaire de l'espace
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isSpaceOwner = booking.space.owner.toString() === req.user._id.toString();

    if (!isOwner && !isSpaceOwner) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      booking: booking.getPublicInfo()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Mettre à jour le statut d'une réservation
// @access  Private (propriétaire de l'espace)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Le statut est requis'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('space', 'owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'espace
    if (booking.space.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Validation du statut
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Si annulation, vérifier la raison
    if (status === 'CANCELLED' && !cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison d\'annulation est requise'
      });
    }

    const updateData = { status };
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('space user', 'name firstName lastName email');

    res.json({
      success: true,
      message: 'Statut de la réservation mis à jour avec succès',
      booking: updatedBooking.getPublicInfo()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);

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
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/bookings/:id/payment
// @desc    Mettre à jour le statut de paiement
// @access  Private
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Le statut de paiement est requis'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Validation du statut de paiement
    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de paiement invalide'
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('space user', 'name firstName lastName email');

    res.json({
      success: true,
      message: 'Statut de paiement mis à jour avec succès',
      booking: updatedBooking.getPublicInfo()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/bookings/:id/review
// @desc    Ajouter un avis et une note à une réservation
// @access  Private (utilisateur qui a fait la réservation)
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Une note valide entre 1 et 5 est requise'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('space');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Vérifier que la réservation est terminée
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez évaluer qu\'une réservation terminée'
      });
    }

    // Vérifier qu'un avis n'a pas déjà été donné
    if (booking.rating) {
      return res.status(400).json({
        success: false,
        message: 'Un avis a déjà été donné pour cette réservation'
      });
    }

    // Mettre à jour la réservation
    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Mettre à jour la note moyenne de l'espace
    await booking.space.updateRating(rating);

    res.json({
      success: true,
      message: 'Avis ajouté avec succès',
      booking: booking.getPublicInfo()
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/bookings/space/:spaceId
// @desc    Récupérer les réservations d'un espace (pour le propriétaire)
// @access  Private (propriétaire de l'espace)
router.get('/space/:spaceId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Vérifier que l'utilisateur est le propriétaire de l'espace
    const space = await Space.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Espace non trouvé'
      });
    }

    if (space.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Construire les filtres
    const filters = { space: req.params.spaceId };
    if (status) filters.status = status;

    const bookings = await Booking.find(filters)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filters);

    res.json({
      success: true,
      data: bookings.map(booking => booking.getPublicInfo()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des réservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/bookings/calculate-price
// @desc    Calculer le prix d'une réservation
// @access  Public
router.post('/calculate-price', async (req, res) => {
  try {
    const { spaceId, startDate, endDate, startTime, endTime } = req.body;

    if (!spaceId || !startDate || !endDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Tous les paramètres sont requis'
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const totalPrice = await Booking.calculatePrice(
      spaceId,
      parsedStartDate,
      parsedEndDate,
      startTime,
      endTime
    );

    res.json({
      success: true,
      totalPrice,
      currency: 'FCFA'
    });

  } catch (error) {
    console.error('❌ Erreur lors du calcul du prix:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/bookings/availability/:spaceId
// @desc    Vérifier la disponibilité d'un espace à une date donnée
// @access  Public
router.get('/availability/:spaceId', async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { date, startTime, endTime } = req.query;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'date, startTime et endTime sont requis'
      });
    }
    const startDate = new Date(date);
    const endDate = new Date(date);
    const hasConflicts = await Booking.checkConflicts(
      spaceId,
      startDate,
      endDate,
      startTime,
      endTime
    );
    res.json({
      success: true,
      available: !hasConflicts
    });
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification de disponibilité'
    });
  }
});

module.exports = router; 