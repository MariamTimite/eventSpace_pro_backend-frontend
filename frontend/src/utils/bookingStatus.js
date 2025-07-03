/**
 * Configuration des statuts de réservation
 */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

/**
 * Textes d'affichage pour chaque statut
 */
export const getStatusText = (status) => {
  if (!status) return 'Statut inconnu';
  const s = status.toLowerCase();
  switch (s) {
    case BOOKING_STATUS.PENDING:
      return 'En attente';
    case BOOKING_STATUS.CONFIRMED:
      return 'Confirmée';
    case BOOKING_STATUS.IN_PROGRESS:
      return 'En cours';
    case BOOKING_STATUS.COMPLETED:
      return 'Terminée';
    case BOOKING_STATUS.CANCELLED:
      return 'Annulée';
    case BOOKING_STATUS.REJECTED:
      return 'Refusée';
    default:
      return 'Statut inconnu';
  }
};

/**
 * Classes Tailwind pour le style de chaque statut
 */
export const getStatusStyle = (status) => {
  if (!status) return { badge: 'bg-gray-100 text-gray-800', icon: 'text-gray-500', button: 'bg-gray-100 hover:bg-gray-200 text-gray-800' };
  const s = status.toLowerCase();
  switch (s) {
    case BOOKING_STATUS.PENDING:
      return {
        badge: 'bg-yellow-100 text-yellow-800',
        icon: 'text-yellow-500',
        button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
      };
    case BOOKING_STATUS.CONFIRMED:
      return {
        badge: 'bg-green-100 text-green-800',
        icon: 'text-green-500',
        button: 'bg-green-100 hover:bg-green-200 text-green-800'
      };
    case BOOKING_STATUS.IN_PROGRESS:
      return {
        badge: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-500',
        button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
      };
    case BOOKING_STATUS.COMPLETED:
      return {
        badge: 'bg-gray-100 text-gray-800',
        icon: 'text-gray-500',
        button: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      };
    case BOOKING_STATUS.CANCELLED:
      return {
        badge: 'bg-red-100 text-red-800',
        icon: 'text-red-500',
        button: 'bg-red-100 hover:bg-red-200 text-red-800'
      };
    case BOOKING_STATUS.REJECTED:
      return {
        badge: 'bg-red-100 text-red-800',
        icon: 'text-red-500',
        button: 'bg-red-100 hover:bg-red-200 text-red-800'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-800',
        icon: 'text-gray-500',
        button: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      };
  }
};

/**
 * Vérifie si une action est possible selon le statut actuel
 */
export const canPerformAction = {
  cancel: (status) => [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(status?.toLowerCase?.()),
  edit: (status) => [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(status?.toLowerCase?.()),
  confirm: (status) => status?.toLowerCase?.() === BOOKING_STATUS.PENDING,
  reject: (status) => status?.toLowerCase?.() === BOOKING_STATUS.PENDING,
  start: (status) => status?.toLowerCase?.() === BOOKING_STATUS.CONFIRMED,
  complete: (status) => status?.toLowerCase?.() === BOOKING_STATUS.IN_PROGRESS
};

/**
 * Messages explicatifs pour chaque statut
 */
export const getStatusDescription = (status) => {
  if (!status) return '';
  const s = status.toLowerCase();
  switch (s) {
    case BOOKING_STATUS.PENDING:
      return 'En attente de confirmation par l\'administrateur';
    case BOOKING_STATUS.CONFIRMED:
      return 'Réservation confirmée, en attente de la date';
    case BOOKING_STATUS.IN_PROGRESS:
      return 'Réservation en cours d\'utilisation';
    case BOOKING_STATUS.COMPLETED:
      return 'Réservation terminée';
    case BOOKING_STATUS.CANCELLED:
      return 'Réservation annulée par l\'utilisateur';
    case BOOKING_STATUS.REJECTED:
      return 'Réservation refusée par l\'administrateur';
    default:
      return '';
  }
};

/**
 * Obtient le prochain statut possible selon l'action
 */
export const getNextStatus = (currentStatus, action) => {
  switch (action) {
    case 'confirm':
      return BOOKING_STATUS.CONFIRMED;
    case 'reject':
      return BOOKING_STATUS.REJECTED;
    case 'cancel':
      return BOOKING_STATUS.CANCELLED;
    case 'start':
      return BOOKING_STATUS.IN_PROGRESS;
    case 'complete':
      return BOOKING_STATUS.COMPLETED;
    default:
      return currentStatus;
  }
}; 