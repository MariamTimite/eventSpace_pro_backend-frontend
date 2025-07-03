const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Service d'envoi d'emails
const emailService = {
  // Envoyer un email de test
  sendTestEmail: async (to) => {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@eventspace.com',
        to: to,
        subject: 'Test Email - EventSpace Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Test Email EventSpace Pro</h2>
            <p>Ceci est un email de test pour vérifier que le système d'envoi d'emails fonctionne correctement.</p>
            <p>Date d'envoi: ${new Date().toLocaleString()}</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système EventSpace Pro.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de test envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email de test:', error);
      throw error;
    }
  },

  // Envoyer une notification de modification de réservation
  sendBookingModification: async (booking, changes) => {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@eventspace.com',
        to: booking.user.email,
        subject: 'Modification de votre réservation - EventSpace Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Modification de réservation</h2>
            <p>Bonjour ${booking.user.firstName},</p>
            <p>Votre réservation a été modifiée avec succès.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Détails de la réservation :</h3>
              <p><strong>Espace :</strong> ${booking.space.name}</p>
              <p><strong>Date :</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
              <p><strong>Heure :</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p><strong>Participants :</strong> ${booking.numberOfPeople}</p>
              <p><strong>Statut :</strong> ${booking.status}</p>
            </div>

            ${changes ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Modifications apportées :</h3>
              <ul>
                ${changes.date ? '<li>Date de réservation</li>' : ''}
                ${changes.time ? '<li>Heures de réservation</li>' : ''}
                ${changes.people ? '<li>Nombre de participants</li>' : ''}
                ${changes.requirements ? '<li>Demandes spéciales</li>' : ''}
              </ul>
            </div>
            ` : ''}

            <p>Merci de votre confiance !</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système EventSpace Pro.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de modification envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email de modification:', error);
      throw error;
    }
  },

  // Envoyer une notification d'annulation
  sendBookingCancellation: async (booking, reason) => {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@eventspace.com',
        to: booking.user.email,
        subject: 'Annulation de votre réservation - EventSpace Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Annulation de réservation</h2>
            <p>Bonjour ${booking.user.firstName},</p>
            <p>Votre réservation a été annulée.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Détails de la réservation annulée :</h3>
              <p><strong>Espace :</strong> ${booking.space.name}</p>
              <p><strong>Date :</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
              <p><strong>Heure :</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p><strong>Raison :</strong> ${reason || 'Non spécifiée'}</p>
            </div>

            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système EventSpace Pro.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email d\'annulation envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email d\'annulation:', error);
      throw error;
    }
  },

  async sendBookingNotificationToAdmin({ to, userName, spaceName, startDate, endDate, startTime, endTime, totalPrice }) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@eventspace.com',
      to,
      subject: 'Nouvelle réservation reçue',
      html: `
        <h2>Nouvelle réservation sur EventSpace Pro</h2>
        <p><strong>Utilisateur :</strong> ${userName}</p>
        <p><strong>Espace :</strong> ${spaceName}</p>
        <p><strong>Date :</strong> ${new Date(startDate).toLocaleDateString()}${endDate && endDate !== startDate ? ' au ' + new Date(endDate).toLocaleDateString() : ''}</p>
        <p><strong>Heure :</strong> ${startTime} - ${endTime}</p>
        <p><strong>Prix total :</strong> ${totalPrice} FCFA</p>
        <p>Connectez-vous à l'interface admin pour gérer cette réservation.</p>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  }
};

module.exports = emailService; 