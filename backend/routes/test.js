const express = require('express');
const emailService = require('../services/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/test/email
// @desc    Envoyer un email de test
// @access  Private
router.post('/email', auth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const result = await emailService.sendTestEmail(email);

    res.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de test:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message
    });
  }
});

module.exports = router; 