import React, { useState } from 'react';

const AdvancedSearch = ({ onSearch, onReset }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minCapacity: '',
    maxCapacity: '',
    minPrice: '',
    maxPrice: '',
    date: '',
    time: '',
    amenities: [],
    location: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'conference', label: 'Salle de conférence' },
    { value: 'meeting', label: 'Salle de réunion' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'event', label: 'Salle d\'événement' },
    { value: 'coworking', label: 'Espace de coworking' },
    { value: 'training', label: 'Salle de formation' }
  ];

  const amenities = [
    { value: 'projector', label: 'Projecteur' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'catering', label: 'Service de catering' },
    { value: 'parking', label: 'Parking' },
    { value: 'accessibility', label: 'Accès handicapé' },
    { value: 'video-conference', label: 'Visioconférence' },
    { value: 'whiteboard', label: 'Tableau blanc' },
    { value: 'audio-system', label: 'Système audio' },
    { value: 'air-conditioning', label: 'Climatisation' },
    { value: 'natural-light', label: 'Lumière naturelle' }
  ];

  const locations = [
    'Paris Centre',
    'Paris Nord',
    'Paris Sud',
    'Paris Est',
    'Paris Ouest',
    'La Défense',
    'Montparnasse',
    'Châtelet'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      minCapacity: '',
      maxCapacity: '',
      minPrice: '',
      maxPrice: '',
      date: '',
      time: '',
      amenities: [],
      location: ''
    });
    onReset();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recherche avancée</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isExpanded ? 'Masquer' : 'Afficher'} les filtres
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Rechercher un espace..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Category and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les localisations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capacity Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité (personnes)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="minCapacity"
                  value={filters.minCapacity}
                  onChange={handleInputChange}
                  placeholder="Min"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxCapacity"
                  value={filters.maxCapacity}
                  onChange={handleInputChange}
                  placeholder="Max"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix par heure (FCFA)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  placeholder="Min"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  placeholder="Max"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure souhaitée
                </label>
                <select
                  name="time"
                  value={filters.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toute heure</option>
                  <option value="morning">Matin (8h-12h)</option>
                  <option value="afternoon">Après-midi (12h-17h)</option>
                  <option value="evening">Soirée (17h-22h)</option>
                </select>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipements
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map(amenity => (
                  <label key={amenity.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity.value)}
                      onChange={() => handleAmenityChange(amenity.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Rechercher
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSearch; 