import React from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaPlay, 
  FaStop,
  FaInfoCircle 
} from 'react-icons/fa';
import { 
  BOOKING_STATUS, 
  getStatusText, 
  getStatusStyle, 
  canPerformAction,
  getStatusDescription 
} from '../../utils/bookingStatus';

const BookingStatusBadge = ({ 
  status, 
  onStatusChange, 
  showActions = true,
  isAdmin = false 
}) => {
  const styles = getStatusStyle(status);

  const handleAction = (action) => {
    if (typeof onStatusChange === 'function') {
      onStatusChange(action);
    }
  };

  const renderActionButtons = () => {
    if (!showActions) return null;

    const buttons = [];

    // Actions pour l'admin
    if (isAdmin) {
      if (canPerformAction.confirm(status)) {
        buttons.push(
          <button
            key="confirm"
            onClick={() => handleAction('confirm')}
            className={`p-2 rounded-full hover:opacity-80 bg-green-100 text-green-800`}
            title="Confirmer la réservation"
          >
            <FaCheck className="w-4 h-4" />
          </button>
        );
      }

      if (canPerformAction.reject(status)) {
        buttons.push(
          <button
            key="reject"
            onClick={() => handleAction('reject')}
            className={`p-2 rounded-full hover:opacity-80 bg-red-100 text-red-800`}
            title="Refuser la réservation"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        );
      }

      if (canPerformAction.start(status)) {
        buttons.push(
          <button
            key="start"
            onClick={() => handleAction('start')}
            className={`p-2 rounded-full hover:opacity-80 bg-blue-100 text-blue-800`}
            title="Démarrer la réservation"
          >
            <FaPlay className="w-4 h-4" />
          </button>
        );
      }

      if (canPerformAction.complete(status)) {
        buttons.push(
          <button
            key="complete"
            onClick={() => handleAction('complete')}
            className={`p-2 rounded-full hover:opacity-80 bg-gray-100 text-gray-800`}
            title="Terminer la réservation"
          >
            <FaStop className="w-4 h-4" />
          </button>
        );
      }
    }

    return buttons.length > 0 ? (
      <div className="flex items-center space-x-2 ml-3">
        {buttons}
      </div>
    ) : null;
  };

  return (
    <div className="flex items-center group">
      <div className={`relative flex items-center px-3 py-1 rounded-full ${styles.badge}`}>
        <span className="text-sm font-medium">
          {getStatusText(status)}
        </span>
        <div className="relative ml-1 group">
          <FaInfoCircle className="w-4 h-4 text-current opacity-50 cursor-help" />
          <div className="absolute left-1/2 bottom-full mb-2 w-48 transform -translate-x-1/2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 text-center">
              {getStatusDescription(status)}
              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderActionButtons()}
    </div>
  );
};

export default BookingStatusBadge; 