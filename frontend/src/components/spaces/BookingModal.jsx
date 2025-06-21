import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api';

const BookingModal = ({ space, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    purpose: '',
    specialRequirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (isOpen && space) {
      // Calculer le prix total
      const hours = formData.startTime && formData.endTime 
        ? (new Date(`2000-01-01T${formData.endTime}`) - new Date(`2000-01-01T${formData.startTime}`)) / (1000 * 60 * 60)
        : 0;
      setTotalPrice(hours * space.pricePerHour);
    }
  }, [formData.startTime, formData.endTime, space, isOpen]);

  useEffect(() => {
    if (isOpen && formData.date && space) {
      checkAvailability();
    }
  }, [formData.date, space, isOpen]);

  const checkAvailability = async () => {
    try {
      const response = await bookingService.getAvailability(space.id, formData.date);
      setAvailability(response.data.availableSlots || []);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.date) {
      setError('Veuillez sélectionner une date');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Veuillez sélectionner les heures de début et de fin');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return false;
    }
    if (formData.attendees < 1) {
      setError('Le nombre de participants doit être au moins 1');
      return false;
    }
    if (formData.attendees > space.maxCapacity) {
      setError(`Le nombre maximum de participants pour cet espace est ${space.maxCapacity}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        spaceId: space._id || space.id,
        startDate: formData.date,
        endDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfPeople: formData.attendees,
        specialRequests: formData.specialRequirements
        // paymentMethod: 'CASH' // optionnel, à ajouter si tu veux
      };

      const response = await bookingService.create(bookingData);
      
      onSuccess(response.data);
      onClose();
      
      // Reset form
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        attendees: 1,
        purpose: '',
        specialRequirements: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Réserver {space?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Space Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <img
                src={space?.images?.[0] || '/placeholder-space.jpg'}
                alt={space?.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{space?.name}</h3>
                <p className="text-sm text-gray-600">{space?.location}</p>
                <p className="text-sm text-gray-600">
                  Capacité: {space?.maxCapacity} personnes • {space?.pricePerHour?.toLocaleString()} FCFA/heure
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de réservation *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début *
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin *
              </label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de participants *
            </label>
            <input
              type="number"
              name="attendees"
              value={formData.attendees}
              onChange={handleInputChange}
              min="1"
              max={space?.maxCapacity}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum: {space?.maxCapacity} personnes
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectif de la réservation
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez brièvement l'objectif de votre réservation..."
            />
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exigences spéciales
            </label>
            <textarea
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Exigences particulières, équipements supplémentaires..."
            />
          </div>

          {/* Price Summary */}
          {totalPrice > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prix total estimé:</span>
                <span className="text-lg font-semibold text-blue-600">{totalPrice.toLocaleString()} FCFA</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                * Le prix final sera confirmé après validation de votre réservation
              </p>
            </div>
          )}

          {/* Availability Info */}
          {availability.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Créneaux disponibles:</h4>
              <div className="flex flex-wrap gap-2">
                {availability.map((slot, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Réservation...
                </div>
              ) : (
                'Confirmer la réservation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 