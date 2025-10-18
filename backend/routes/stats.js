const express = require('express');
const Space = require('../models/Space');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats/dashboard
// @desc    Récupérer les statistiques générales du dashboard admin
// @access  Private (Admin)
router.get('/dashboard', auth, async (req, res) => {
  try {
    console.log('🔐 Vérification des droits admin...');
    if (req.user.role !== 'ADMIN') {
      console.log('❌ Accès refusé - utilisateur non admin:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    console.log('✅ Utilisateur admin confirmé, récupération des statistiques...');

    // Statistiques générales
    const totalSpaces = await Space.countDocuments();
    const activeSpaces = await Space.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'CONFIRMED' });

    // Revenus totaux
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Revenus du mois en cours
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenueResult = await Booking.aggregate([
      { 
        $match: { 
          status: 'CONFIRMED',
          createdAt: { $gte: currentMonth }
        } 
      },
      { $group: { _id: null, monthlyRevenue: { $sum: '$totalPrice' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].monthlyRevenue : 0;

    // Réservations récentes (dernières 10)
    const recentBookings = await Booking.find()
      .populate('space', 'name')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Espaces populaires (top 5)
    const popularSpaces = await Space.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'space',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          bookingCount: { $size: '$bookings' },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: '$$booking.totalPrice'
              }
            }
          }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          type: 1,
          bookingCount: 1,
          totalRevenue: 1,
          isActive: 1
        }
      }
    ]);

    // Utilisateurs actifs récents
    const activeUsersRecent = await User.find({ isActive: true })
      .sort({ lastLogin: -1 })
      .limit(5)
      .select('firstName lastName email lastLogin');

    // Statistiques par mois (derniers 6 mois)
    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    console.log('📊 Statistiques calculées:', {
      totalSpaces,
      activeSpaces,
      totalUsers,
      activeUsers,
      totalBookings,
      confirmedBookings,
      totalRevenue,
      monthlyRevenue
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalSpaces,
          activeSpaces,
          totalUsers,
          activeUsers,
          totalBookings,
          confirmedBookings,
          totalRevenue,
          monthlyRevenue
        },
        recentBookings: recentBookings.map(booking => ({
          id: booking._id,
          space: booking.space?.name || 'Espace supprimé',
          user: booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Utilisateur supprimé',
          userEmail: booking.user?.email,
          date: booking.startDate,
          status: booking.status,
          amount: booking.totalPrice
        })),
        popularSpaces,
        activeUsersRecent,
        monthlyStats
      }
    });

    console.log('✅ Réponse envoyée avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// @route   GET /api/stats/spaces
// @desc    Récupérer les statistiques détaillées des espaces
// @access  Private (Admin)
router.get('/spaces', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    const spaces = await Space.find()
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Ajouter les statistiques de réservations pour chaque espace
    const spacesWithStats = await Promise.all(
      spaces.map(async (space) => {
        const bookingStats = await Booking.aggregate([
          { $match: { space: space._id } },
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              confirmedBookings: {
                $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] }
              },
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ]);

        const stats = bookingStats.length > 0 ? bookingStats[0] : {
          totalBookings: 0,
          confirmedBookings: 0,
          totalRevenue: 0
        };

        return {
          ...space.toObject(),
          bookingStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: spacesWithStats
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques des espaces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   GET /api/stats/users
// @desc    Récupérer les statistiques des utilisateurs
// @access  Private (Admin)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    const users = await User.find()
      .sort({ createdAt: -1 });

    // Ajouter les statistiques de réservations pour chaque utilisateur
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingStats = await Booking.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              confirmedBookings: {
                $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] }
              },
              totalSpent: { $sum: '$totalPrice' }
            }
          }
        ]);

        const stats = bookingStats.length > 0 ? bookingStats[0] : {
          totalBookings: 0,
          confirmedBookings: 0,
          totalSpent: 0
        };

        return {
          ...user.toObject(),
          bookingStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   GET /api/stats/bookings
// @desc    Récupérer les statistiques des réservations
// @access  Private (Admin)
router.get('/bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    const { status, startDate, endDate, limit = 50 } = req.query;

    let filters = {};
    if (status) filters.status = status;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filters)
      .populate('space', 'name type')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques des réservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;
