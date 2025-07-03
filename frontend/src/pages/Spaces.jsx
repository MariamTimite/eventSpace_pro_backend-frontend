import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdvancedSearch from '../components/spaces/AdvancedSearch';
import { spaceService } from '../services/api';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Spaces = () => {
  const { isAuthenticated, user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Fonction pour obtenir l'image appropriée selon la catégorie
  const getSpaceImage = (category, id) => {
    const images = {
      'Conference': [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=300&fit=crop'
      ],
      'Coworking': [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600508774634-4e482d6ec4d8?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600508774634-4e482d6ec4d8?w=400&h=300&fit=crop'
      ],
      'Meeting': [
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop'
      ],
      'Studio': [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      ],
      'Event': [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
      ],
      'Training': [
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop'
      ]
    };
    
    const categoryImages = images[category] || images['Conference'];
    return categoryImages[(id - 1) % categoryImages.length];
  };

  useEffect(() => {
    setLoading(true);
    spaceService.getAll()
      .then(res => {
        setSpaces(res.data.data);
        setFilteredSpaces(res.data.data);
      })
      .catch(() => setSpaces([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', 'Conference', 'Coworking', 'Meeting', 'Studio', 'Event', 'Training'];
  const capacities = ['Tous', '1-10', '11-25', '26-50', '51-100', '100+'];

  const handleSimpleFilter = () => {
    let filtered = spaces;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(space =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory && selectedCategory !== 'Tous') {
      filtered = filtered.filter(space => space.category === selectedCategory);
    }

    // Filtre par capacité
    if (selectedCapacity && selectedCapacity !== 'Tous') {
      const [min, max] = selectedCapacity.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(space => space.capacity >= min && space.capacity <= max);
      } else {
        filtered = filtered.filter(space => space.capacity >= min);
      }
    }

    setFilteredSpaces(filtered);
  };

  const handleAdvancedSearch = (filters) => {
    let filtered = spaces;

    // Appliquer tous les filtres avancés
    if (filters.category && filters.category !== 'Tous') {
      filtered = filtered.filter(space => space.category === filters.category);
    }

    if (filters.minCapacity) {
      filtered = filtered.filter(space => space.capacity >= filters.minCapacity);
    }

    if (filters.maxCapacity) {
      filtered = filtered.filter(space => space.capacity <= filters.maxCapacity);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(space => space.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(space => space.price <= filters.maxPrice);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(space =>
        filters.amenities.every(amenity => space.amenities.includes(amenity))
      );
    }

    if (filters.location) {
      filtered = filtered.filter(space =>
        space.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredSpaces(filtered);
    setShowAdvancedSearch(false);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCapacity('');
    setFilteredSpaces(spaces);
    setShowAdvancedSearch(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet espace ?')) return;
    try {
      await spaceService.delete(id);
      setSpaces(prev => prev.filter(space => space._id !== id && space.id !== id));
      setFilteredSpaces(prev => prev.filter(space => space._id !== id && space.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    handleSimpleFilter();
  }, [searchTerm, selectedCategory, selectedCapacity, spaces]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des espaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Espaces disponibles
          </h1>
          <p className="text-gray-600">
            Trouvez l'espace parfait pour votre événement parmi notre sélection
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom, description, lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité
              </label>
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {capacities.map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </select>
            </div>

            {/* Advanced Search Button */}
            <div className="flex items-end">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
              >
                {showAdvancedSearch ? 'Masquer' : 'Recherche avancée'}
              </button>
            </div>
          </div>

          {/* Advanced Search */}
          {showAdvancedSearch && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <AdvancedSearch onSearch={handleAdvancedSearch} />
            </div>
          )}

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredSpaces.length} espace{filteredSpaces.length !== 1 ? 's' : ''} trouvé{filteredSpaces.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="container mx-auto py-8">
          {user?.role === 'ADMIN' && (
            <div className="mb-4 flex justify-end">
              <Link
                to="/spaces/create"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Créer un espace
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => {
              console.log('Images pour', space.name, space.images);
              return (
                <div key={space.id || space._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={space.images && space.images.length > 0
                        ? (space.images[0].startsWith('http')
                            ? space.images[0]
                            : `http://localhost:5001/${space.images[0].replace(/\\/g, '/')}`)
                        : getSpaceImage(space.category, space.id)}
                      alt={space.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full">
                      <span className="text-sm font-semibold text-gray-900">{space.price.toLocaleString()} FCFA/jour</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{space.name}</h3>
                      <div className="flex items-center">
                        <span>
                          {space.rating?.average !== undefined ? `${space.rating.average} ★` : 'N/A'}
                          {space.rating?.count !== undefined ? ` (${space.rating.count} avis)` : ''}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{space.description}</p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {space.location}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        <strong>Capacité:</strong> {space.capacity} personnes
                      </span>
                      <span className="text-sm text-gray-600">
                        <strong>Catégorie:</strong> {space.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {space.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {amenity}
                        </span>
                      ))}
                      {space.amenities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{space.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 items-center">
                      <Link to={`/spaces/${space._id || space.id}`} aria-label="Détails" className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-100 transition">
                        <FaEye className="text-blue-600 text-lg" />
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link to={`/spaces/edit/${space._id || space.id}`} aria-label="Modifier" className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-yellow-100 transition">
                            <FaEdit className="text-yellow-500 text-lg" />
                          </Link>
                          <button onClick={() => handleDelete(space._id || space.id)} aria-label="Supprimer" className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-red-100 transition">
                            <FaTrash className="text-red-600 text-lg" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* No Results */}
        {filteredSpaces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun espace trouvé</h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Spaces; 