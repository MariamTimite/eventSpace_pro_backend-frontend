const express = require('express');
const Space = require('../models/Space');
const { auth } = require('../middleware/auth');
const { 
  uploadSpaceImages, 
  handleUploadError, 
  cleanupFiles,
  deleteFiles 
} = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/spaces
// @desc    Créer un nouvel espace
// @access  Private (propriétaire)
router.post('/', auth, uploadSpaceImages, handleUploadError, cleanupFiles, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      capacity,
      price,
      priceType,
      amenities,
      address,
      coordinates,
      openingHours
    } = req.body;

    // Validation des champs requis
    if (!name || !description || !type || !capacity || !price || !priceType || !address || !coordinates) {
      req.cleanupUploadedFiles();
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être fournis'
      });
    }

    // Validation des images
    if (!req.files || req.files.length === 0) {
      req.cleanupUploadedFiles();
      return res.status(400).json({
        success: false,
        message: 'Au moins une image est requise'
      });
    }

    // Préparer les chemins des images
    const images = req.files.map(file => file.path);

    // Parser les données JSON
    const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
    const parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    const parsedAmenities = amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [];
    const parsedOpeningHours = openingHours ? (typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours) : {};

    const space = new Space({
      name: name.trim(),
      description: description.trim(),
      type,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      priceType,
      amenities: parsedAmenities,
      images,
      address: parsedAddress,
      coordinates: parsedCoordinates,
      openingHours: parsedOpeningHours,
      owner: req.user._id
    });

    const savedSpace = await space.save();

    res.status(201).json({
      success: true,
      message: 'Espace créé avec succès',
      space: savedSpace.getPublicInfo()
    });

  } catch (error) {
    // Nettoyer les fichiers en cas d'erreur
    if (req.cleanupUploadedFiles) {
      req.cleanupUploadedFiles();
    }

    console.error('❌ Erreur lors de la création de l\'espace:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }

    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return res.status(400).json({
        success: false,
        message: 'Format JSON invalide pour les données'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'espace'
    });
  }
});

// @route   GET /api/spaces
// @desc    Récupérer tous les espaces avec filtres ou ceux du propriétaire
// @access  Public ou Private (si owner=true)
router.get('/', async (req, res, next) => {
  // Si owner=true, on veut les espaces du propriétaire connecté
  if (req.query.owner === 'true') {
    return auth(req, res, async () => {
      try {
        const {
          page = 1,
          limit = 10,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;

        const filters = { owner: req.user._id };
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const spaces = await Space.find(filters)
          .populate('owner', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));

        const total = await Space.countDocuments(filters);

        return res.json({
          success: true,
          data: spaces.map(space => space.getPublicInfo()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des espaces du propriétaire:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur serveur'
        });
      }
    });
  }
  // Sinon, comportement public actuel
  next();
});

// Route publique pour tous les espaces
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      city,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      isAvailable,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire les filtres
    const filters = { isActive: true };
    
    if (type) filters.type = type;
    if (city) filters['address.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }
    if (minCapacity || maxCapacity) {
      filters.capacity = {};
      if (minCapacity) filters.capacity.$gte = parseInt(minCapacity);
      if (maxCapacity) filters.capacity.$lte = parseInt(maxCapacity);
    }
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const spaces = await Space.find(filters)
      .populate('owner', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Space.countDocuments(filters);

    res.json({
      success: true,
      data: spaces.map(space => space.getPublicInfo()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des espaces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/spaces/:id
// @desc    Récupérer un espace par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const space = await Space.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate({
        path: 'bookings',
        match: { status: { $in: ['PENDING', 'CONFIRMED'] } },
        options: { limit: 5 }
      });

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Espace non trouvé'
      });
    }

    if (!space.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Espace non disponible'
      });
    }

    res.json({
      success: true,
      space: space.getPublicInfo()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'espace:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/spaces/:id
// @desc    Mettre à jour un espace
// @access  Private (propriétaire)
router.put('/:id', auth, uploadSpaceImages, handleUploadError, cleanupFiles, async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      req.cleanupUploadedFiles();
      return res.status(404).json({
        success: false,
        message: 'Espace non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire OU admin
    if (space.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      req.cleanupUploadedFiles && req.cleanupUploadedFiles();
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const updateData = { ...req.body };

    // Gérer les nouvelles images si fournies
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      
      // Supprimer les anciennes images
      if (space.images && space.images.length > 0) {
        deleteFiles(space.images);
      }
      
      updateData.images = newImages;
    }

    // Parser les données JSON si nécessaire
    if (updateData.address && typeof updateData.address === 'string') {
      updateData.address = JSON.parse(updateData.address);
    }
    if (updateData.coordinates && typeof updateData.coordinates === 'string') {
      updateData.coordinates = JSON.parse(updateData.coordinates);
    }
    if (updateData.amenities && typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }
    if (updateData.openingHours && typeof updateData.openingHours === 'string') {
      updateData.openingHours = JSON.parse(updateData.openingHours);
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Espace mis à jour avec succès',
      space: updatedSpace.getPublicInfo()
    });

  } catch (error) {
    // Nettoyer les fichiers en cas d'erreur
    if (req.cleanupUploadedFiles) {
      req.cleanupUploadedFiles();
    }

    console.error('❌ Erreur lors de la mise à jour de l\'espace:', error);

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
      message: 'Erreur serveur lors de la mise à jour'
    });
  }
});

// @route   DELETE /api/spaces/:id
// @desc    Supprimer un espace
// @access  Private (propriétaire)
router.delete('/:id', auth, async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Espace non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire OU admin
    if (space.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Supprimer les images
    if (space.images && space.images.length > 0) {
      deleteFiles(space.images);
    }

    await Space.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Espace supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'espace:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/spaces/owner/my-spaces
// @desc    Récupérer les espaces du propriétaire
// @access  Private
router.get('/owner/my-spaces', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const spaces = await Space.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Space.countDocuments({ owner: req.user._id });

    res.json({
      success: true,
      data: spaces.map(space => space.getPublicInfo()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des espaces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router; 