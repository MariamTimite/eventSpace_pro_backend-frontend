import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingService, spaceService, notificationService } from '../../services/api';
import TimeSlotPicker from '../../components/spaces/TimeSlotPicker';
import { validateBookingSlot } from '../../utils/dateValidation';

const EditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState(null);
  const [booking, setBooking] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 1,
    specialRequirements: ''
  });

  // Charger les données de la réservation
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const bookingResponse = await bookingService.getById(id);
        const booking = bookingResponse.data;
        setBooking(booking);
        
        // Charger les détails de l'espace
        const spaceResponse = await spaceService.getById(booking.spaceId);
        setSpace(spaceResponse.data);

        // Pré-remplir le formulaire
        setFormData({
          date: booking.startDate.split('T')[0],
          startTime: booking.startTime,
          endTime: booking.endTime,
          numberOfPeople: booking.numberOfPeople,
          specialRequirements: booking.specialRequirements || ''
        });

        // Vérifier les disponibilités pour cette date
        await checkAvailability(booking.startDate.split('T')[0], booking.spaceId);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement de la réservation', 'error');
        navigate('/dashboard');
      }
    };

    fetchBookingData();
  }, [id]);

  const checkAvailability = async (date, spaceId) => {
    try {
      const response = await bookingService.getAvailability(spaceId, date);
      setAvailability(response.data.availableSlots || []);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      showNotification('Erreur lors de la vérification des disponibilités', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Vérifier les disponibilités si la date change
    if (name === 'date' && space) {
      checkAvailability(value, space._id);
    }
  };

  const validateForm = () => {
    // Règles de validation spécifiques
    const rules = {
      minDuration: 0.5, // 30 minutes minimum
      maxDuration: 12, // 12 heures maximum
      minHoursInAdvance: 24, // Réservation 24h à l'avance minimum
      maxMonthsInAdvance: 3 // Réservation jusqu'à 3 mois à l'avance
    };

    const validation = validateBookingSlot({
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime
    }, rules);

    if (!validation.isValid) {
      showNotification(validation.message, 'error');
      return false;
    }

    if (!formData.date || !formData.startTime || !formData.endTime) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return false;
    }

    if (formData.numberOfPeople < 1) {
      showNotification('Le nombre de participants doit être au moins 1', 'error');
      return false;
    }

    if (space && formData.numberOfPeople > space.maxCapacity) {
      showNotification(`Le nombre maximum de participants pour cet espace est ${space.maxCapacity}`, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Préparer les données de la réservation
      const bookingData = {
        spaceId: space._id,
        startDate: formData.date,
        endDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfPeople: formData.numberOfPeople,
        specialRequirements: formData.specialRequirements
      };

      // Mettre à jour la réservation
      const response = await bookingService.update(id, bookingData);
      
      // Préparer les données pour la notification
      const notificationData = {
        oldBooking: booking, // Ancienne réservation
        newBooking: response.data, // Nouvelle réservation
        changes: {
          date: booking.startDate !== formData.date,
          time: booking.startTime !== formData.startTime || booking.endTime !== formData.endTime,
          people: booking.numberOfPeople !== formData.numberOfPeople,
          requirements: booking.specialRequirements !== formData.specialRequirements
        }
      };

      // Envoyer la notification par email
      await notificationService.bookingNotifications.sendBookingModification(id, notificationData);

      showNotification('Réservation modifiée avec succès', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showNotification(
        error.response?.data?.message || 'Erreur lors de la modification de la réservation', 
        'error'
      );
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await bookingService.cancel(id);
      
      // Envoyer la notification d'annulation
      await notificationService.bookingNotifications.sendBookingCancellation(
        id,
        'Annulation par l\'utilisateur'
      );

      showNotification('Réservation annulée avec succès', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      showNotification(
        'Erreur lors de l\'annulation de la réservation',
        'error'
      );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la réservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Modifier la réservation
            </h2>
          </div>

          {/* Space Info */}
          {space && (
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center space-x-4">
                <img
                  src={space.images?.[0] || '/placeholder.jpg'}
                  alt={space.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{space.name}</h3>
                  <p className="text-sm text-gray-600">{space.location}</p>
                  <p className="text-sm text-gray-600">
                    Capacité: {space.maxCapacity} personnes • {space.pricePerHour?.toLocaleString()} FCFA/heure
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                min={new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Les réservations doivent être faites au moins 24h à l'avance et au maximum 3 mois à l'avance
              </p>
            </div>

            {/* Time Selection */}
            <TimeSlotPicker
              startTime={formData.startTime}
              endTime={formData.endTime}
              availableSlots={availability}
              currentBookingId={id}
              onStartTimeChange={(value) => handleInputChange({ target: { name: 'startTime', value } })}
              onEndTimeChange={(value) => handleInputChange({ target: { name: 'endTime', value } })}
            />

            {/* Number of People */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de participants *
              </label>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleInputChange}
                min="1"
                max={space?.maxCapacity}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demandes spéciales
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: configuration de la salle, équipements spécifiques..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelBooking}
                className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Annuler la réservation
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Modifier la réservation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBooking; 