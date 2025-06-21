import React from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';

const TimeSlotPicker = ({ 
  startTime, 
  endTime, 
  availableSlots, 
  onStartTimeChange, 
  onEndTimeChange,
  currentBookingId = null // Pour exclure la réservation en cours de modification
}) => {
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

  const isSlotAvailable = (time, isStart) => {
    if (!availableSlots || !availableSlots.length) return true;
    
    // Si on modifie une réservation existante, on exclut ses créneaux
    const relevantSlots = availableSlots.filter(slot => 
      !currentBookingId || slot.bookingId !== currentBookingId
    );

    // Pour l'heure de début, on vérifie si le créneau est libre
    if (isStart) {
      return !relevantSlots.some(slot => 
        time >= slot.startTime && time < slot.endTime
      );
    }
    
    // Pour l'heure de fin, on vérifie si tous les créneaux entre startTime et endTime sont libres
    if (startTime) {
      return !relevantSlots.some(slot =>
        (startTime < slot.endTime && time > slot.startTime) ||
        (startTime >= slot.startTime && time <= slot.endTime)
      );
    }

    return true;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Heure de début *
        </label>
        <div className="relative">
          <select
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionner une heure</option>
            {timeSlots.map(time => (
              <option 
                key={time} 
                value={time}
                disabled={!isSlotAvailable(time, true)}
              >
                {time} {!isSlotAvailable(time, true) && '(Indisponible)'}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaClock className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Heure de fin *
        </label>
        <div className="relative">
          <select
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionner une heure</option>
            {timeSlots.map(time => (
              <option 
                key={time} 
                value={time}
                disabled={!isSlotAvailable(time, false) || time <= startTime}
              >
                {time} {!isSlotAvailable(time, false) && '(Indisponible)'}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaClock className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {availableSlots && availableSlots.length > 0 && (
        <div className="col-span-full">
          <div className="flex items-start space-x-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <p>
              Certains créneaux sont déjà réservés à cette date. 
              Les créneaux indisponibles sont grisés dans la sélection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker; 