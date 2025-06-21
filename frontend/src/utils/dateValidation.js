/**
 * Utilitaires de validation pour les dates et heures de réservation
 */

/**
 * Vérifie si une date est dans le passé
 * @param {string} date - Date au format YYYY-MM-DD
 * @returns {boolean}
 */
export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Vérifie si une heure est dans le passé pour une date donnée
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {string} time - Heure au format HH:mm
 * @returns {boolean}
 */
export const isTimeInPast = (date, time) => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const checkDateTime = new Date(date);
  checkDateTime.setHours(hours, minutes, 0, 0);
  return checkDateTime < now;
};

/**
 * Calcule la durée en heures entre deux heures
 * @param {string} startTime - Heure de début au format HH:mm
 * @param {string} endTime - Heure de fin au format HH:mm
 * @returns {number} Durée en heures (peut être décimale)
 */
export const calculateDuration = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const start = startHours + startMinutes / 60;
  const end = endHours + endMinutes / 60;
  
  return end - start;
};

/**
 * Vérifie si une durée de réservation est valide
 * @param {string} startTime - Heure de début au format HH:mm
 * @param {string} endTime - Heure de fin au format HH:mm
 * @param {Object} rules - Règles de validation (durées min/max)
 * @returns {Object} Résultat de la validation
 */
export const validateDuration = (startTime, endTime, rules = {}) => {
  const duration = calculateDuration(startTime, endTime);
  const minDuration = rules.minDuration || 0.5; // 30 minutes par défaut
  const maxDuration = rules.maxDuration || 12; // 12 heures par défaut

  if (duration < minDuration) {
    return {
      isValid: false,
      message: `La durée minimum de réservation est de ${minDuration} heure${minDuration > 1 ? 's' : ''}`
    };
  }

  if (duration > maxDuration) {
    return {
      isValid: false,
      message: `La durée maximum de réservation est de ${maxDuration} heure${maxDuration > 1 ? 's' : ''}`
    };
  }

  return { isValid: true };
};

/**
 * Vérifie si une date est dans la plage autorisée pour les réservations
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {Object} rules - Règles de validation
 * @returns {Object} Résultat de la validation
 */
export const validateBookingDate = (date, rules = {}) => {
  const checkDate = new Date(date);
  const today = new Date();
  const maxDate = new Date();
  
  // Par défaut, on peut réserver jusqu'à 3 mois à l'avance
  maxDate.setMonth(maxDate.getMonth() + (rules.maxMonthsInAdvance || 3));
  
  // Délai minimum avant réservation (24h par défaut)
  const minHoursInAdvance = rules.minHoursInAdvance || 24;
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + minHoursInAdvance);

  if (checkDate < minDate) {
    return {
      isValid: false,
      message: `Les réservations doivent être faites au moins ${minHoursInAdvance} heures à l'avance`
    };
  }

  if (checkDate > maxDate) {
    return {
      isValid: false,
      message: `Les réservations ne peuvent pas être faites plus de ${rules.maxMonthsInAdvance || 3} mois à l'avance`
    };
  }

  return { isValid: true };
};

/**
 * Vérifie si un créneau horaire est valide pour une réservation
 * @param {Object} booking - Données de la réservation
 * @param {Object} rules - Règles de validation
 * @returns {Object} Résultat de la validation avec messages d'erreur
 */
export const validateBookingSlot = (booking, rules = {}) => {
  const { date, startTime, endTime } = booking;

  // Vérification de la date
  if (isDateInPast(date)) {
    return {
      isValid: false,
      message: 'La date de réservation ne peut pas être dans le passé'
    };
  }

  // Vérification de la plage de réservation
  const dateValidation = validateBookingDate(date, rules);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  // Pour une réservation aujourd'hui, vérifier si l'heure n'est pas déjà passée
  if (new Date(date).toDateString() === new Date().toDateString() && isTimeInPast(date, startTime)) {
    return {
      isValid: false,
      message: 'L\'heure de début ne peut pas être dans le passé'
    };
  }

  // Vérification de la durée
  const durationValidation = validateDuration(startTime, endTime, rules);
  if (!durationValidation.isValid) {
    return durationValidation;
  }

  return { isValid: true };
}; 